var fileInput = document.querySelector('#file');
var submitButton = document.querySelector('#submit');

fileInput.onchange = function() {

    var reader = new FileReader();

    reader.onload = function() {
        if(!fileInput.files[0].name.endsWith(".csv")) {
            alert('Veuillez sélectionner un fichier csv !');
            submitButton.style.display = "none";
        } else {
            submitButton.style.display = "block";
        }
    };
    reader.readAsText(fileInput.files[0]);
};
