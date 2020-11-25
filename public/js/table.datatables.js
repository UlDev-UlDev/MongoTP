let table;
let importId = window.location.pathname.split('/')[2];

$(()=> {


    table = $("#table").DataTable({
        ajax: "/api/" + importId,
        language: {
            url: "http://cdn.datatables.net/plug-ins/1.10.21/i18n/French.json"
        },
        processing: true,
        serverSide: true,
        bDeferLoading: 10,
        totalPage: 10,
        rowId: "id",
        columns: [
            {data:"last_review"},
            {data: "name"},
            {
                data: "description",
                render: function (data) {
                    if (data.length > 0) {
                        let tab = data.split(" ");
                        if (tab.length > 20) {

                            tab = tab.slice(0, 20);
                            tab.push("...");

                            return tab.join(" ")
                        } else {
                            return data;
                        }
                    }
                    return data;

                }
            },
            {
                data: "review_scores_rating",
                render: function (data, type, row, meta) {
                    return type === 'display' ?
                        '<progress title="' + data + '%" value="' + data + '" max="100"></progress>' :
                        data;
                }
            },
        ]
    })
});