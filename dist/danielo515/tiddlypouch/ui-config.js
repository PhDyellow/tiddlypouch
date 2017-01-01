/*\
type: application/javascript
title: $:/plugins/danielo515/tiddlypouch/ui/config.js
module-type: library

Links the user interface with the configuration methods 

@preserve

\*/
(function(){"use strict";var e="$:/plugins/danielo515/tiddlypouch/config/Debug";var t=e+"/Active";var i=e+"/Verbose";var d="$:/plugins/danielo515/tiddlypouch/config/database_names";var a="$:/plugins/danielo515/tiddlypouch/config/selected_database";var n="$:/plugins/danielo515/tiddlypouch/ui/sync-flag";var o=require("$:/plugins/danielo515/tiddlypouch/utils");exports.refreshUI=function T(e){s(e);g(e.databases[e.selectedDbId]);r();u();c();l()};exports.handlers={};function r(e){var t=$tw.wiki.getTiddler(n);if(e==="offline"||!$TPouch.config.currentDB.getUrl()){return $tw.wiki.addTiddler(new $tw.Tiddler(t,{tags:[]}))}$tw.wiki.addTiddler(new $tw.Tiddler(t,{tags:["$:/tags/PageControls"]}))}exports.setSyncFlag=r;function l(){var e="<<tiddlypouch-tab "+$TPouch.config.currentDB.name+" Database >>";$tw.wiki.addTiddler({title:"$:/SiteSubtitle",text:e})}function c(){var e=$TPouch.config.currentDB.getUrl();var t=$TPouch.config.currentDB.getRemoteName();var i="Login to remote database <b>"+t+"</b> at: "+e;$tw.wiki.addTiddler({title:"$:/language/LoginToTiddlySpace",text:i})}function u(){var e=$TPouch.config.getAllDBNames();$tw.wiki.addTiddler({title:d,list:e,text:"{{!!list}}"})}exports.handlers.updateDebug=function(e){var d=$tw.wiki.getTiddlerText(t)==="yes";var a=$tw.wiki.getTiddlerText(i)==="yes";var n=$TPouch.config.readConfigTiddler();n.debug={active:d,verbose:a};$TPouch.config.update(n)};function s(e){$tw.wiki.addTiddler(new $tw.Tiddler({title:t,text:o.boolToHuman(e.debug.active)}));$tw.wiki.addTiddler(new $tw.Tiddler({title:i,text:o.boolToHuman(e.debug.verbose)}))}exports.handlers.updateDbConfig=function(e){var t=$TPouch.config.readConfigTiddler();var i=$tw.wiki.getTiddlerData(a);t.selectedDbId=i.name;t.databases[i.name]=o.plainToNestedObject(i);$TPouch.config.update(t)};exports.handlers.databaseHasBeenSelected=function(e){var t=e.param;var i=$TPouch.config.getDatabaseConfig(t);g(i)};function g(e){var t=o.flattenObject(e);$tw.wiki.addTiddler(new $tw.Tiddler({title:a,type:"application/json",text:JSON.stringify(t)}))}})();