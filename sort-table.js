/**
 * sort-table.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  Tables sortable
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE.txt
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/sort-table
 */

/**
 * Sort the rows in a HTML Table
 *
 * @param Table The Table DOM object
 * @param col   The zero-based column number by which to sort
 * @returns void
 */
function sortTable(Table, col) {
	var sortClass;

	//get previous sort column
	sortTable.sortCol = -1;
	sortClass = Table.className.match(/js-sort-\d+/);
	if (null != sortClass) {
		sortTable.sortCol = sortClass[0].replace(/js-sort-/, '');
		Table.className = Table.className.replace(new RegExp(' ?' + sortClass[0] + '\\b'), '');
	}

	//get previous sort direction
	sortTable.sortDir = 1;
	sortClass = Table.className.match(/js-sort-(a|de)sc/);
	if (null != sortClass && sortTable.sortCol == col) {
		sortTable.sortDir = 'js-sort-asc' == sortClass[0] ? -1 : 1;
	}
	Table.className = Table.className.replace(/ ?js-sort-(a|de)sc/g, '');

	//update sort column
	Table.className += ' js-sort-' + col;
	sortTable.sortCol = col;

	//update sort direction
	Table.className += ' js-sort-' + (sortTable.sortDir == -1 ? 'desc' : 'asc');

	//get sort type
	sortClass = Table.tHead.rows[0].cells[col].className.match(/js-sort-[-\w]+/);
	if (null != sortClass) {
		sortTable.sortFunc = sortClass[0].replace(/js-sort-/, '');
	} else {
		sortTable.sortFunc = 'string';
	}

	//sort!
	var rows = [],
		TBody = Table.tBodies[0];

	for (var i = 0; i < TBody.rows.length; i++) {
		rows[i] = TBody.rows[i];
	}
	rows.sort(sortTable.compareRow);

	while (TBody.firstChild) {
		TBody.removeChild(TBody.firstChild);
	}
	for (i = 0; i < rows.length; i++) {
		TBody.appendChild(rows[i]);
	}
}

/**
 * Compare two table rows based on current settings
 *
 * @param RowA A TR DOM object
 * @param RowB A TR DOM object
 * @returns {number} 1 if RowA is greater, -1 if RowB, 0 if equal
 */
sortTable.compareRow = function(RowA, RowB) {
	var valA, valB;
	if ('function' != typeof sortTable[sortTable.sortFunc]) {
		sortTable.sortFunc = 'string';
	}
	valA = sortTable[sortTable.sortFunc](RowA.cells[sortTable.sortCol]);
	valB = sortTable[sortTable.sortFunc](RowB.cells[sortTable.sortCol]);

	return valA == valB ? 0 : sortTable.sortDir * (valA > valB ? 1 : -1);
};

/**
 * Strip all HTML, no exceptions
 * @param html
 * @returns {string}
 */
sortTable.stripTags = function(html) {
	return html.replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, '');
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Converts innerHTML to a JS Date object
 *
 * @param Cell A TD DOM object
 * @returns {Date}
 */
sortTable.date = function(Cell) {
	return new Date(sortTable.stripTags(Cell.innerHTML));
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Converts innerHTML to a JS Number object
 *
 * @param Cell A TD DOM object
 * @returns {Number}
 */
sortTable.number = function(Cell) {
	return Number(sortTable.stripTags(Cell.innerHTML).replace(/\$|%|,/, ''));
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Converts innerHTML to a lower case string for insensitive compare
 *
 * @param Cell A TD DOM object
 * @returns {String}
 */
sortTable.string = function(Cell) {
	return sortTable.stripTags(Cell.innerHTML).toLowerCase();
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Captures the last space-delimited token from innerHTML
 *
 * @param Cell A TD DOM object
 * @returns {String}
 */
sortTable.last = function(Cell) {
	return sortTable.stripTags(Cell.innerHTML).split(' ').pop().toLowerCase();
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Captures the value of the first childNode
 *
 * @param Cell A TD DOM object
 * @returns {String}
 */
sortTable.input = function(Cell) {
	for (var i = 0; i < Cell.children.length; i++) {
		if ('object' == typeof Cell.children[i]
			&& 'undefined' != typeof Cell.children[i].value
		) {
			return Cell.children[i].value.toLowerCase();
		}
	}

	return sortTable.string(Cell);
};

/**
 * Attach sortTable() calls to table header cells' onclick events
 * If the table(s) do not have a THead node, one will be created around the
 *  first row
 */
sortTable.init = function() {
	var THead,
		Tables = document.querySelectorAll("table.js-sort-table");

	for (var i = 0; i < Tables.length; i++) {
		if (!Tables[i].tHead) {
			THead = document.createElement('thead');
			THead.appendChild(Tables[i].rows[0]);
			Tables[i].insertBefore(THead, Tables[i].children[0]);
		} else {
			THead = Tables[i].tHead;
		}
		for (var j = 0; j < THead.rows[0].cells.length; j++) {
			THead.rows[0].cells[j].addEventListener('click', (function(Table, col) {
				return function() {
					sortTable(Table, col);
				};
			})(Tables[i], j));
		}
	}
};

//Run sortTable.init() when the page loads
window.addEventListener
	? window.addEventListener('load', sortTable.init, false)
	: window.attachEvent && window.attachEvent('onload', sortTable.init)
	;
