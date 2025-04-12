$(document).ready(function () {
  const table = $('#billsTable').DataTable({
    stripeClasses: [],
    ajax: {
      url: '/data',
      dataSrc: function (json) {
        return json.length ? json : [];
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
    rowCallback: function (row, data) {
      $(row).removeClass("highlight-current highlight-vetoed highlight-nonrubio-current");
      if (data.Session === "2025-2026") {
        if (data.Author === "Rubio") {
          $(row).addClass("highlight-current");
        } else {
          $(row).addClass("highlight-nonrubio-current");
        }
      }
      if (data.Status === "Vetoed") {
        $(row).addClass("highlight-vetoed");
      }
    },
    initComplete: function () {
      function buildDropdown(selector, colIdx, label, exact = false) {
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
          const val = $(this).val();
          const useRegex = exact && val !== "";
          const searchVal = useRegex ? `^${val}$` : val;
          table.column(colIdx).search(searchVal, useRegex, !useRegex).draw();

          if (selector === "#sessionFilter" && val !== "2025-2026") {
            $('#rubioCurrentToggle').prop('checked', false);
          }
          if (selector === "#authorFilter" && val !== "Rubio") {
            $('#rubioAuthorToggle').prop('checked', false);
          }
          if (selector === "#statusFilter") {
            if (val === "Vetoed") {
              $('#vetoedToggle').prop('checked', true);
            }
          }
        });
      }

      buildDropdown('#sessionFilter', 0, "Sessions");
      buildDropdown('#statusFilter', 4, "Statuses");
      buildDropdown('#authorFilter', 2, "Authors", true);

      $('#sessionFilter').val('2025-2026').trigger('change');
      $('#authorFilter').val('Rubio').trigger('change');

      $.fn.dataTable.ext.search.push(function (settings, data) {
        const includeVetoed = $('#vetoedToggle').is(':checked');
        const status = data[4] || "";
        return includeVetoed || status !== "Vetoed";
      });

      table.draw();
    }
  });

  $('#rubioCurrentToggle').on('change', function () {
    $('#sessionFilter').val(this.checked ? '2025-2026' : '').trigger('change');
  });

  $('#rubioAuthorToggle').on('change', function () {
    $('#authorFilter').val(this.checked ? 'Rubio' : '').trigger('change');
  });

  $('#vetoedToggle').on('change', function () {
    table.draw();
  });

  $('#clearFilters').on('click', function () {
    $('#sessionFilter, #statusFilter, #authorFilter').val('');
    table.search('').columns().search('').draw();
    $('#rubioCurrentToggle').prop('checked', false);
    $('#rubioAuthorToggle').prop('checked', false);
    table.draw();
  });
});
