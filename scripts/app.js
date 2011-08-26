$(function () {
	var editor, HTMLMode;

	editor = FileWriter.editor = ace.edit('editor');
	HTMLMode = require("ace/mode/html").Mode;
	editor.getSession().setUseSoftTabs(false);
	editor.getSession().setMode(new HTMLMode());
	//editor.setTheme('ace/theme/monokai');
	editor.getSession().setTabSize(8);
	editor.getSession().setUseWrapMode(false);
	editor.setShowPrintMargin(false);

	$('#new').click(function () {
		var name = prompt('File name? (include extension)', '*.txt');
		FileWriter.files.newFile(name);
	});

	$('#add').click(function () {
		// Coming soon.
	});

	$('#save').click(function () {
		FileWriter.files.saveFile();
	});

	$.contextMenu({
		selector: 'li',
		items: {
			edit: { name: 'Edit' },
			launch: { name: 'Launch (Open in new tab)' },
			rename: { name: 'Rename' },
			separator: '---------',
			'delete': { name: 'Delete' }
		},
		callback: function(key, opt){
			switch (key) {
				case 'edit':
					$(this).click();
					break;
				case 'launch':
					window.open(FileWriter.files.getFileEntry($(this).find('span').data('filename')).toURL());
					break;
				case 'rename':
					var newName = prompt('New name?', '*.txt');

					FileWriter.files.getFileEntry($(this).find('span').data('filename')).moveTo(filesystem.root, newName);
					FileWriter.helpers.refreshList();
					break;
				case 'delete':
					FileWriter.files.getFileEntry($(this).find('span').data('filename')).remove();
					FileWriter.helpers.refreshList();
					break;
			}
		}
	});

	window.webkitRequestFileSystem(window.PERSISTENT, 10*1024*1024, FileWriter.helpers.init, FileWriter.helpers.errorHandler);
});