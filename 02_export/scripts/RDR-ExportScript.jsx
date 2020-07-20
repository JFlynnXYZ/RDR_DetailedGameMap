// This was an attemp to try and create an auotmated export script for this 
// project. However, Adobe's API is very limiting and not allowing for certain
// export options exposed to code so this is just going to lay here until all 
// the features are available. 
//
// This will export all the PDFs as designed but PNGs are not working as 
// intended.


function createFolderForFile(destFile) {
        var folder = new Folder(destFile.split('/').slice(0, -1).join('/'));
        if (!folder.exists) {
            folder.create();
        }
}

function exportFileToPNG(destFile, scaling, bleed) {
    if ( app.documents.length > 0 ) {
        var exportOptions = new ExportOptionsPNG24();
        var type = ExportType.PNG24 ;
        createFolderForFile(destFile);
        var fileSpec = new File(destFile) ;
        exportOptions.antiAliasing = true;
        exportOptions.transparency = false;
        // TODO: Cropping to bleed doesn't work how I would want
        exportOptions.artBoardClipping = !bleed;
        // TODO: Scaling upwards doesn't seem to work
        exportOptions.horizontalScale = scaling;
        exportOptions.verticalScale = scaling;
        app.activeDocument.exportFile(fileSpec, type, exportOptions) ;
    }
}

function exportFileAsPDF (destFile, bleed, marks) {
    if (app.documents.length > 0) {
        var doc = app.activeDocument;
        var original_file = doc.fullName;
        createFolderForFile(destFile);
        var saveName = new File(destFile);
        var saveOpts = new PDFSaveOptions();
        saveOpts.generateThumbnails = true;
        saveOpts.preserveEditability = false;
        saveOpts.bleedLink = false;
        saveOpts.colorDownsampling = 0;
        saveOpts.compressArt = true;
            
        if (!bleed) {
            saveOpts.bleedOffsetRect = Array(0,0,0,0);
            saveOpts.pDFPreset = "RDR_Export";
        }
        
        if (marks) {
            saveOpts.trimMarks = true;
            saveOpts.colorBars = true;
            saveOpts.registrationMarks = true;
        }
        // Can't export or saveAsCopy so we saveAs, close and re-open file
        doc.saveAs(saveName, saveOpts);
        doc.close(SaveOptions.DONOTSAVECHANGES)
        app.open(File(original_file));
    }
}

function main() {
    if (app.documents.length < 0) {
            return 1;
    }
    var CUR_DIR_PATH = app.activeDocument.fullName.parent.parent.fsName;
    var CUR_FNAME =app.activeDocument.name.split('.').slice(0, -1).join('.');

    var export_path = CUR_DIR_PATH + "/02_export";
    var file_names_opts = {};
    file_names_opts[""] = {"filetype": "pdf", "bleed": false, "marks": false};
    file_names_opts["_B40mm"] = {"filetype": "pdf", "bleed": true, "marks": false};
    file_names_opts["_B40mm_Marks"] = {"filetype": "pdf", "bleed": true, "marks": true};
    //file_names_opts["_600ppi"] = {"filetype": "png", "scaling": 200, "bleed": false};
   // file_names_opts["_B40mm_600ppi"] = {"filetype": "png", "scaling": 200, "bleed": true};
    
    for (var key in file_names_opts) {
        var value = file_names_opts[key];
        var fpath = export_path + "/" + value["filetype"] + "/" + CUR_FNAME + key + "." + value["filetype"];
        switch(value["filetype"]) {
                case "pdf":
                    exportFileAsPDF(fpath, value["bleed"], value["marks"]);
                    break;
                case "png":
                    exportFileToPNG(fpath, value["scaling"], value["bleed"]);
                    break;
                default:
                    break;
        }
    }
}

main();