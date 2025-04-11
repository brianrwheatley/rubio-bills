$(document).ready(function () {
  const table = $('#billsTable').DataTable({
    ajax: {
      url: '/data',
      dataSrc: function (json) {
        console.log("Loaded data:", json);
        return json.length ? json : [];
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
    },
    initComplete: function () {
      console.log("Table fully loaded, building filters.");
      function buildDropdown(selector, colIdx, label) {
        const select = $(selector);
        select.empty().append(`<option value="">All ${label}</option>`);
        const uniqueValues = new Set();

        table.column(colIdx).data().each(function (d) {
          const text = $('<div>').html(d).text().trim();
          if (text) uniqueValues.add(text);
        });

        Array.from(uniqueValues).sort().forEach(function (val) {
          select.append(`<option value="${val}">${val}</option>`);
        });

        select.on("change", function () {
          table.column(colIdx).search(this.value).draw();
        });
      }

      buildDropdown('#sessionFilter', 0, "Sessions");
      buildDropdown('#statusFilter', 4, "Statuses");
      buildDropdown('#authorFilter', 2, "Authors");

      $('#sessionFilter').val('2025-2026').trigger('change');
      $('#authorFilter').val('Rubio').trigger('change');
    }
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
