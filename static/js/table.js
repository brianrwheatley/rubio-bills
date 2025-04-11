$(document).ready(function () {
  const table = $('#billsTable').DataTable({
    ajax: {
      url: '/data',
      dataSrc: function (json) {
        console.log("Loaded data:", json);
        return json.length ? json : []; // fallback for bad/empty loads
      },
      error: function (xhr, error, thrown) {
        console.error("AJAX Error:", error, thrown);
      }
    },
    columns: [
      { data: 'Session' },
      {
        data: 'Bill',
        render: function (data, type, row) {
          const link = row.Bill_link;
          return row.Author === "Rubio" ? '<a href="' + link + '" target="_blank"><b>' + data + '</b></a>' :
                                          '<a href="' + link + '" target="_blank">' + data + '</a>';
        }
      },
      {
        data: 'Author',
        render: function (data) {
          return data === "Rubio" ? '<b>' + data + '</b>' : data;
        }
      },
      { data: 'Subject' },
      { data: 'Status' }
    ],
    paging: false,
    order: [[0, 'desc']],
    createdRow: function (row, data) {
      if (data.Session === "2025-2026" && data.Author === "Rubio") {
        $(row).addClass("highlight-current");
      }
    }
  });

  function filterDropdown(id, colIdx, label) {
    const select = $(id);
    select.empty().append(`<option value="">All ${label}</option>`);
    table.column(colIdx).data().unique().sort().each(function (d) {
      const text = $('<div>').html(d).text().trim();
      if (text) select.append(`<option value="${text}">${text}</option>`);
    });
    select.on("change", function () {
      table.column(colIdx).search(this.value).draw();
    });
  }

  $.getJSON('/data', function (data) {
    if (data.length === 0) {
      console.warn("No data returned from /data.");
    } else {
      console.log("Populating filters with", data.length, "rows.");
    }
    setTimeout(function () {
      filterDropdown('#sessionFilter', 0, "Sessions");
      filterDropdown('#statusFilter', 4, "Statuses");
      filterDropdown('#authorFilter', 2, "Authors");
      $('#sessionFilter').val('2025-2026').trigger('change');
      $('#authorFilter').val('Rubio').trigger('change');
    }, 50);
  });

  $('#clearFilters').on('click', function () {
    $('#sessionFilter, #statusFilter, #authorFilter').val('');
    table.search('').columns().search('').draw();
    $('#rubioCurrentToggle').prop('checked', false);
  });

  $('#rubioCurrentToggle').on('change', function () {
    if (this.checked) {
      $('#sessionFilter').val('2025-2026').trigger('change');
      $('#authorFilter').val('Rubio').trigger('change');
    } else {
      $('#sessionFilter, #authorFilter').val('').trigger('change');
    }
  });
});
