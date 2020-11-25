//Url de la page détails
let urlPageDetails =  window.location.pathname;


//Navigation page détails
$(document).ready(function () {
    $('#table tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            $('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        document.location.href = urlPageDetails + "/" + table.row(this).id();
    });

});
