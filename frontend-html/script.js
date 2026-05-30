function uploadImage() {
  const fileInput = document.getElementById("imageInput");
  const result = document.getElementById("result");

  if (!fileInput.files.length) {
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const xhr = new XMLHttpRequest();

  xhr.open("POST", "http://127.0.0.1:5000/upload-image", true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const res = JSON.parse(xhr.responseText);

      let html = `<h3>Detected Product: ${res.product}</h3>`;

      res.results.forEach(item => {
        html += `
          <div style="border:1px solid #ccc;padding:10px;margin:10px;">
            <p><b>Title:</b> ${item.title}</p>
            <p><b>Price:</b> ${item.price}</p>
            <p><b>Source:</b> ${item.source}</p>
            <a href="${item.link}" target="_blank">View Product</a>
          </div>
        `;
      });

      result.innerHTML = html;

    } else {
      alert("Error comparing product");
    }
  };

  xhr.onerror = function () {
    alert("Network error");
  };

  xhr.send(formData);
}