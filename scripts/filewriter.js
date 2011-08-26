/* Attempt at a semi-professional library for this stuff. */
(function () {
	var filesystem, fileList = [], currentFile;

	var FileWriter = {
		editor: null,

		/* File control functions */
		files: {
			loadFile: function (filename) {
				filesystem.root.getFile(filename, { create: true }, function (fileEntry) {
					currentFile = fileEntry;

					fileEntry.file(function (file) {
						var reader = new FileReader();

						reader.onloadend = function (e) {
							FileWriter.editor.getSession().setValue(this.result);
						};

						reader.readAsText(file);
					}, FileWriter.helpers.errorHandler);
				}, FileWriter.helpers.errorHandler);

				$('#editor').keypress(function () {
					// Update the title/name with an asterisk signifying it's unsaved.
				});
			},

			newFile: function (n) {
				filesystem.root.getFile(n, { create: true });
				FileWriter.helpers.refreshList();
			},

			addFiles: function () {
				// Import functionality to be added later.
			},

			saveFile: function () {
				currentFile.createWriter(function (fileWriter) {
					var bb = new WebKitBlobBuilder();
					FileWriter.editor.getSession().setValue(FileWriter.editor.getSession()
						.getValue().replace('[FILEWRITER]', filesystem.root.toURL()));
					bb.append(FileWriter.editor.getSession().getValue());
					fileWriter.write(bb.getBlob(FileWriter.helpers.getMime(currentFile)));
					console.log(FileWriter.helpers.getMime(currentFile));
				}, FileWriter.helpers.errorHandler);
			},

			getFileEntry: function (n) {
				var i, matched;
				for (i = 0; i < fileList.length; i = i + 1) {
					if (fileList[i].name === n) {
						matched = fileList[i];
					}
				}
				return matched;
			}
		},

		/* Helper functions */
		helpers: {
			init: function (fs) {
				filesystem = fs;
				FileWriter.helpers.refreshList();
			},

			listResults: function (entries) {
				var fragment = document.createDocumentFragment();

				entries.forEach(function (entry, i) {
					var li = document.createElement('li');
					if (entry.name.search('.htm') !== -1) {
						li.innerHTML = ['<span data-filename="', entry.name, '">', entry.name, 
							'<a class="launch" href="', entry.toURL() ,'" target="_blank">Launch</a></span>'].join('');
					}
					else {
						li.innerHTML = ['<span data-filename="', entry.name, '">', entry.name, '</span>'].join('');
					}
					fragment.appendChild(li);
					fileList[i] = entry;
				});

				currentFile = fileList[0];
				$('#files').append(fragment);

				// Unfortunately these have to be binded here and not in app.js since
				// the li's were inserted dynamically.
				$('#files li').click(function () {
					var filename = $(this).find('span').data('filename');
					$('title').html(filename);
					FileWriter.files.saveFile();
					FileWriter.files.loadFile(filename);
					$('#files>li>span').removeClass('active');
					$(this).find('span').addClass('active');
				});

				$('#files li:first-child').click();
			},

			refreshList: function () {
				var readEntries, dirReader, entries = [];

				$('#files').html('');
				dirReader = filesystem.root.createReader();
				readEntries = function () {
					dirReader.readEntries(function (results) {
						if (!results.length) {
							FileWriter.helpers.listResults(entries.sort());
						} else {
							entries = entries.concat(FileWriter.helpers.toArray(results));
							readEntries();
						}
					});
				};
				readEntries();
			},

			toArray: function (list) {
				return Array.prototype.slice.call(list || [], 0);
			},

			getMime: function (file) {
				var name = file.name;
				
				if (name.search('.js') !== -1) {
					return 'text/javascript';
				}
				else if (name.search('.css') !== -1) {
					return 'text/css';
				}
				else if (name.search('.htm') !== -1) {
					return 'text/html';
				}
				else {
					return 'text/plain';
				}
			},

			errorHandler: function (e) {
				var msg = '';

				switch (e.code) {
					case FileError.QUOTA_EXCEEDED_ERR:
						msg = 'QUOTA_EXCEEDED_ERR';
						break;
					case FileError.NOT_FOUND_ERR:
						msg = 'NOT_FOUND_ERR';
						break;
					case FileError.SECURITY_ERR:
						msg = 'SECURITY_ERR';
						break;
					case FileError.INVALID_MODIFICATION_ERR:
						msg = 'INVALID_MODIFICATION_ERR';
						break;
					case FileError.INVALID_STATE_ERR:
						msg = 'INVALID_STATE_ERR';
						break;
					default:
						msg = 'Unknown Error';
						break;
				}

				console.log('Error: ' + msg);
			}
		}
	};

	window.FileWriter = window.FileWriter || FileWriter;
})();