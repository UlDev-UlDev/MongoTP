var fileInput = document.querySelector('#file');

fileInput.onchange = function() {

    var reader = new FileReader();

    reader.onload = function() {
        if(fileInput.files[0].name.endsWith(".csv")) {
            alert('Contenu du fichier "' + fileInput.files[0].name + '" :\n\n' + reader.result);
            //envoyer le contenu du fichier au back et rediriger vers la 2eme page
            //document.location =
        } else {
            alert('Veuillez sélectionner un fichier csv !');
        }
    };
    reader.readAsText(fileInput.files[0]);
};
