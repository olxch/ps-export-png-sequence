#target photoshop

// ─────────────────────────────────────────────
//  Export PNG Sequence  –  v2.0
//  Author : Oleksii Chervoniuk
//  LinkedIn: https://www.linkedin.com/in/oleksii-chervoniuk/
//
//  Changes:
//    • No dependency on document names
//    • Proper group handling (recursive flatten)
//    • Reliable trim / no-trim logic
//    • try/catch per layer — one failure won't kill the whole run
//    • Filename sanitization (invalid characters)
//    • Empty document validation
//    • Redundant activeDocument calls removed
// ─────────────────────────────────────────────

// ── UI ──────────────────────────────────────
var dlg = new Window('dialog', 'Export PNG Sequence');
dlg.alignChildren = 'left';
dlg.margins = 16;
dlg.spacing = 10;

dlg.add('statictext', undefined, 'Prefix:');
var prefixInput = dlg.add('edittext', undefined, 'seq_');
prefixInput.characters = 20;

var trimCheckbox = dlg.add('checkbox', undefined, 'Trim transparent edges (crop to content)');
trimCheckbox.value = false;

var groupExpand = dlg.add('checkbox', undefined, 'Flatten groups (export each layer inside)');
groupExpand.value = true;

var folderGroup = dlg.add('group');
var folderPathText = folderGroup.add('statictext', undefined, 'No folder selected');
folderPathText.preferredSize.width = 260;
var chooseBtn = folderGroup.add('button', undefined, 'Choose Folder');

var btnGroup = dlg.add('group');
btnGroup.alignment = 'right';
var cancelBtn = btnGroup.add('button', undefined, 'Cancel');
var exportBtn = btnGroup.add('button', undefined, 'Export Layers');

// ── State ────────────────────────────────────
var exportFolder = null;

chooseBtn.onClick = function () {
    exportFolder = Folder.selectDialog('Select export folder');
    if (exportFolder) folderPathText.text = exportFolder.fsName;
};

cancelBtn.onClick = function () {
    dlg.close();
};

// ── Utilities ────────────────────────────────

/**
 * Strips characters that are invalid in file names.
 */
function sanitizeFileName(name) {
    return name.replace(/[\/\\:*?"<>|]/g, '_');
}

/**
 * Recursively collects all layers (non-groups) from a layer collection.
 * If expandGroups = false, groups are returned as single items.
 */
function collectLayers(layers, expandGroups) {
    var result = [];
    for (var i = layers.length - 1; i >= 0; i--) {
        var layer = layers[i];
        if (layer.typename === 'LayerSet' && expandGroups) {
            // Recursively expand group
            var inner = collectLayers(layer.layers, expandGroups);
            for (var j = 0; j < inner.length; j++) result.push(inner[j]);
        } else {
            result.push(layer);
        }
    }
    return result;
}

/**
 * Exports a single layer as PNG.
 * Returns true on success, error string on failure.
 */
function exportLayer(sourceDoc, layer, filePath, doTrim) {
    var tempDoc = null;
    try {
        tempDoc = app.documents.add(
            sourceDoc.width,
            sourceDoc.height,
            sourceDoc.resolution,
            '__export_temp__',
            NewDocumentMode.RGB,
            DocumentFill.TRANSPARENT
        );

        app.activeDocument = sourceDoc;
        layer.duplicate(tempDoc, ElementPlacement.PLACEATBEGINNING);

        app.activeDocument = tempDoc;

        // Remove any extra layers PS may have added (e.g. background)
        while (tempDoc.layers.length > 1) {
            tempDoc.layers[tempDoc.layers.length - 1].remove();
        }

        if (doTrim) {
            tempDoc.trim(TrimType.TRANSPARENT);
        }

        var pngOpts = new PNGSaveOptions();
        pngOpts.interlaced = false;

        var saveFile = new File(filePath);
        tempDoc.saveAs(saveFile, pngOpts, true, Extension.LOWERCASE);

        return true;
    } catch (e) {
        return 'Error on layer "' + layer.name + '": ' + e.message;
    } finally {
        if (tempDoc) {
            app.activeDocument = tempDoc;
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        }
        app.activeDocument = sourceDoc;
    }
}

// ── Export ───────────────────────────────────
exportBtn.onClick = function () {
    if (!exportFolder) {
        alert('Please select an export folder first.');
        return;
    }

    var rawPrefix = prefixInput.text;
    var prefix = sanitizeFileName(rawPrefix);
    if (prefix !== rawPrefix) {
        if (!confirm(
            'The prefix contains invalid characters.\n' +
            'It will be saved as: "' + prefix + '"\n\nContinue?'
        )) return;
    }

    var doc = app.activeDocument;

    if (doc.layers.length === 0) {
        alert('The document contains no layers.');
        return;
    }

    var doTrim      = trimCheckbox.value;
    var doExpand    = groupExpand.value;
    var layers      = collectLayers(doc.layers, doExpand);

    if (layers.length === 0) {
        alert('No exportable layers found.');
        return;
    }

    dlg.close();

    var successCount = 0;
    var errors       = [];

    for (var i = 0; i < layers.length; i++) {
        var layer    = layers[i];
        var num      = ('000' + (i + 1)).slice(-4);   // 4 digits: 0001..9999
        var fileName = prefix + num + '.png';
        var filePath = exportFolder.fsName + '/' + fileName;

        var result = exportLayer(doc, layer, filePath, doTrim);
        if (result === true) {
            successCount++;
        } else {
            errors.push(result);
        }
    }

    // ── Summary ───────────────────────────────
    var msg = 'Done! Saved: ' + successCount + ' of ' + layers.length + ' files.';
    if (errors.length > 0) {
        msg += '\n\nErrors (' + errors.length + '):\n' + errors.join('\n');
    }
    alert(msg);
};

dlg.center();
dlg.show();
