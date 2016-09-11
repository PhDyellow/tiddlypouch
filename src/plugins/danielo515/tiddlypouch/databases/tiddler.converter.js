/*\
title: $:/plugins/danielo515/tiddlypouch/converters/tiddler
type: application/javascript
module-type: library

a conversor that makes tiddlers compatible with pouchdb. This injects the required methods into the db store to handle conversions between regular tiddlers and couchdb

@preserve

\*/

'use strict'

/*jslint node: true, browser: true */
/*global $tw: false */
/* global module */
/**====================== Tiddler conversor dependency  ========================== */
/** @namespace {converters} tiddler.converter */

module.exports.inject = tiddlerConverter;

/**
 * Injects methods to handle conversions between regular TW tiddlers and CouchDB 
 * 
 * @param {DbStore} db a database instance where methods should be injected
 * @return {DbStore} The same db with the methods already injected
 */
 function tiddlerConverter( db ) {
    /**===================== CONVERSIONS BETWEEN TW AND PouchDB ============= */
    /**
    * CouchDB does not like document IDs starting with '_'.
    * Convert leading '_' to '%5f' and leading '%' to '%25'
    * Only used to compute _id / URL for a tiddler. Does not affect 'title' field.
    * @param {String} title The title of the tiddler to mangle
    * @return {String} The same title ready to be inserted into PouchDB/couchdb
    */
    db._mangleTitle = function mangleTitle(title) {
        if (title.length == 0) {
            return title;
        }
        var firstChar = title.charAt(0);
        var restOfIt = title.substring(1);
        if (firstChar === '_') {
            return '%5f' + restOfIt;
        }
        else if (firstChar === '%') {
            return '%25' + restOfIt;
        }
        else {
            return title;
        }
    };

    /**
     * Copy all fields to "fields" sub-object except for the "revision" field.
     * See also: TiddlyWebAdaptor.prototype.convertTiddlerToTiddlyWebFormat.
     * 
     * @param {Tiddler} tiddler - the tiddler to convert to CouchDB format
     * @param {object} tiddlerInfo - The metadata about the tiddler that the sync mechanism of tiddlywiki provides.
     *                               This includes the revision and other metadata related to the tiddler that is not
     *                               included in the tiddler.
     * @static 
     * @private 
     * @returns {object} doc - An document object that represents the tiddler. Ready to be inserted into CouchDB 
     */
   db._convertToCouch = function convertToCouch(tiddler, tiddlerInfo) {
        var result = { fields: {} };
        if (tiddler) {
            $tw.utils.each(tiddler.fields, function (element, title, object) {
                if (title === "revision") {
                    /* do not store revision as a field */
                    return;
                }
                if (title === "_attachments" && !tiddler.isDraft()) {
                    //Since the draft and the original tiddler are not the same document
                    //the draft does not has the attachments
                    result._attachments = element; //attachments should be stored out of fields object
                    return;
                }
                // Convert fields to string
                result.fields[title] = tiddler.getFieldString(title);
            });
            // tags must stay as array, so fix it
            result.fields.tags = tiddler.fields.tags;
        }
        // Default the content type
        result.fields.type = result.fields.type || "text/vnd.tiddlywiki";
        result._id = this._mangleTitle(tiddler.fields.title);
        result._rev = tiddler.fields.revision; //Temporary workaround. Remove
        if (tiddlerInfo.adaptorInfo && tiddlerInfo.adaptorInfo._rev) {
            result._rev = tiddlerInfo.adaptorInfo._rev;
        }
        result._rev = this._validateRevision(result._rev);
        return result;
    },

    /**
     * Transforms a pouchd document extracting just the fields that should be 
     * part of the tiddler discarding all the metadata related to PouchDB.
     * For this version just copy all fields across except _rev and _id
     * @static 
     * @param {object} document - The fields 
     * @returns {object} fields ready for being added to a wiki store
     */
    db._convertFromCouch = function convertFromCouch(doc) {
        var result = {};
        this.logger && this.logger.debug("Converting from ", doc);
        // Transfer the fields, pulling down the `fields` hashmap
        $tw.utils.each(doc, function (element, field, obj) {
            if (field === "fields") {
                $tw.utils.each(element, function (element, subTitle, obj) {
                    result[subTitle] = element;
                });
            } else if (field === "_id" || field === "_rev") {
                /* skip these */
            } else {
                result[field] = doc[field];
            }
        });
        result["revision"] = doc["_rev"];
        //console.log("Conversion result ", result);
        return result;
    }

    return db;
}