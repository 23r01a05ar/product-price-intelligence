from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker


DATABASE_URL = "sqlite:///price_intelligence.db"


engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(128), nullable=True)
    image_url = Column(String(512), nullable=True)

    prices = relationship("Price", back_populates="product", cascade="all, delete-orphan")
    searches = relationship("SearchHistory", back_populates="product", cascade="all, delete-orphan")


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    store_name = Column(String(64), nullable=False)
    price = Column(Float, nullable=True)
    currency = Column(String(8), default="USD")
    product_url = Column(String(512), nullable=True)
    seller_rating = Column(String(64), nullable=True)
    shipping = Column(String(128), nullable=True)
    raw_price_text = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product", back_populates="prices")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    query = Column(String(255), nullable=False)
    user_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String(64), nullable=True)

    product = relationship("Product", back_populates="searches")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    store_name = Column(String(64), nullable=False)
    price = Column(Float, nullable=True)
    url = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db_session():
    return SessionLocal()


def get_or_create_product(db, name: str) -> Product:
    normalized = name.strip()
    product = (
        db.query(Product)
        .filter(Product.name.ilike(normalized))
        .first()
    )
    if product:
        return product

    product = Product(name=normalized)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def record_search_and_prices(db, product: Product, query: str, results: list, user_id: str | None = None):
    search = SearchHistory(
        product_id=product.id,
        query=query,
        user_id=user_id,
        source="image" if user_id is None else "api",
    )
    db.add(search)

    for r in results:
        price_value = parse_price_to_float(r.get("price"))
        db.add(
            Price(
                product_id=product.id,
                store_name=r.get("platform") or r.get("source") or r.get("store_name") or "Unknown",
                price=price_value,
                currency=r.get("currency") or "USD",
                product_url=r.get("product_url") or r.get("link"),
                seller_rating=str(r.get("seller_rating")) if r.get("seller_rating") is not None else None,
                shipping=r.get("shipping"),
                raw_price_text=str(r.get("price")) if r.get("price") is not None else None,
            )
        )

    db.commit()


def parse_price_to_float(price_value):
    if price_value is None:
        return None
    if isinstance(price_value, (int, float)):
        return float(price_value)

    text = str(price_value)
    digits = []
    decimal_seen = False
    for ch in text:
        if ch.isdigit():
            digits.append(ch)
        elif ch == "." and not decimal_seen:
            digits.append(ch)
            decimal_seen = True
    try:
        return float("".join(digits)) if digits else None
    except ValueError:
        return None

