$(document).ready(function () {
  const table = $('#billsTable').DataTable({
    ajax: '/data',
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

  function filterDropdown(id, colIdx) {
    $(id).on("change", function () {
      table.column(colIdx).search(this.value).draw();
    });
  }

  function populateFilters(data) {
    const sessionSet = new Set(), statusSet = new Set(), authorSet = new Set();
    data.forEach(row => {
      if (row.Session) sessionSet.add(row.Session);
      if (row.Status) statusSet.add(row.Status);
      if (row.Author) authorSet.add(row.Author);
    });

    for (const val of [...sessionSet].sort()) $('#sessionFilter').append(`<option value="${val}">${val}</option>`);
    for (const val of [...statusSet].sort()) $('#statusFilter').append(`<option value="${val}">${val}</option>`);
    for (const val of [...authorSet].sort()) $('#authorFilter').append(`<option value="${val}">${val}</option>`);
  }

  $.getJSON('/data', function (data) {
    populateFilters(data);
    $('#sessionFilter').val('2025-2026').trigger('change');
    $('#authorFilter').val('Rubio').trigger('change');
  });

  filterDropdown('#sessionFilter', 0);
  filterDropdown('#statusFilter', 4);
  filterDropdown('#authorFilter', 2);

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
