
$(document).ready(function () {
  const table = $('#billsTable').DataTable({
    ajax: {
      url: "/data",
      dataSrc: "data"
    },
    columns: [
      { data: "Session" },
      { data: "Bill" },
      { data: "Author" },
      { data: "Subject" },
      { data: "Status" }
    ],
    responsive: true,
    autoWidth: false,
    stripeClasses: [],

    initComplete: function () {
      const data = this.api().data().toArray();

      function populateFilter(selector, key) {
        const uniqueValues = [...new Set(data.map(row => row[key]))].sort();
        for (const value of uniqueValues) {
          $(selector).append(`<option value="${value}">${value}</option>`);
        }
      }

      populateFilter("#sessionFilter", "Session");
      populateFilter("#statusFilter", "Status");
      populateFilter("#authorFilter", "Author");

      function filterTable() {
        const session = $("#sessionFilter").val();
        const status = $("#statusFilter").val();
        const author = $("#authorFilter").val();
        const showCurrent = $("#currentSessionCheckbox").is(":checked");
        const showRubio = $("#rubioCheckbox").is(":checked");
        const showVetoed = $("#vetoedCheckbox").is(":checked");

        table.clear().rows.add(data.filter(row => {
          const sessionMatch = !session || row.Session === session;
          const statusMatch = !status || row.Status === status;
          const authorMatch = !author || row.Author === author;
          const currentMatch = !showCurrent || row.Session === "2025-2026";
          const rubioMatch = !showRubio || (row.Author === "Rubio");
          const vetoedMatch = showVetoed || row.Status !== "Vetoed";
          return sessionMatch && statusMatch && authorMatch && currentMatch && rubioMatch && vetoedMatch;
        })).draw();
      }

      $("#sessionFilter, #statusFilter, #authorFilter").on("change", function () {
        if ($("#sessionFilter").val() !== "2025-2026") {
          $("#currentSessionCheckbox").prop("checked", false);
        }
        if ($("#authorFilter").val() !== "Rubio") {
          $("#rubioCheckbox").prop("checked", false);
        }
        if ($("#statusFilter").val() === "Vetoed") {
          $("#vetoedCheckbox").prop("checked", true);
        }
        filterTable();
      });

      $("#currentSessionCheckbox, #rubioCheckbox, #vetoedCheckbox").on("change", filterTable);

      $("#clearFilters").on("click", function () {
        $("#sessionFilter, #statusFilter, #authorFilter").val("");
        $("#currentSessionCheckbox").prop("checked", false);
        $("#rubioCheckbox").prop("checked", false);
        filterTable();
      });

      filterTable();
    },

    rowCallback: function (row, data) {
      $(row).removeClass("highlight-current highlight-vetoed highlight-nonrubio-current");

      if (data.Status === "Vetoed") {
        $(row).addClass("highlight-vetoed");
      } else if (data.Session === "2025-2026" && data.Author === "Rubio") {
        $(row).addClass("highlight-current");
      } else if (data.Session === "2025-2026") {
        $(row).addClass("highlight-nonrubio-current");
      }
    }
  });
});
