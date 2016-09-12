/*\
title: $:/plugins/danielo515/tiddlypouch/database/router.js
type: application/javascript
module-type: library

Routes tiddlers between databases. What it actually does is return the destination database for a given tiddler.
It is the responsability of the entity that is requesting the routing to act on that destination.

@preserve

\*/

'use strict';

/*jslint node: true, browser: true */

/**====================== EXPORTS  ========================== */

module.exports = DbRouter;



/**====================== DEFAULTS  ========================== */

function defaultRouter(tiddler, destinations ){
    if( destinations.default ){
            return 'default';
        }
    throw new Error('There is no default route set!')
}

var defaultRoute = {
    name: 'default',
    canRoute: function(){ return true },
    route: defaultRouter
};

/**
 * Route interface
 * 
 * @interface Route
 */
/**
 * 
 * 
 * @function 
 * @name Route#canRoute
 * @param {object} tiddler - The tiddler to be routed
 * @returns {boolean} true if this route is capable of routing the given tiddler. False otherwhise
 */


/**
 * 
 * Creates a new instance of the databases router.  
 * It is responsible of returning a valid db destination for a given tiddler.
 * The caller should know what to do with the returned database, it is out of the scope of this Class.
 * @class
 *  
 * @param {any} defaultDb - The database used as fallback if there is no route that can route the current tiddler
 * @return {null} This should be called with the new operator.
 */
function DbRouter ( defaultDb ){
    this.destinations = {'default': defaultDb };
    this.routes = [ defaultRoute ];
}

/**
 * Adds a route at the ond of the routes array.
 * It checks that the route conforms with the required API (AKA interface)
 * @param {object} route - The route to add to the list of routes. Should implement the  {@link Route} interface
 * @return {DbRouter} a reference to the current router for method chaining.
 */
DbRouter.prototype.addRoute = function( route ){
    if( (typeof route === 'object') && ( typeof route.canRoute === 'function' ) && (typeof route.route === 'function') ) {
        this.routes.push(route);
        return this
    }

    var err = new Error('Invalid route. Routes should include "canRoute" and "route" methods');
    throw err;
};

/**
 * Adds a destination to the map of destinations
 * @param {any} database - A database instance
 * @param {string} name - The name the database will have in the destinations map. It can override any existing destination.
 * @return {DbRouter} a reference to the current router for method chaining
 */
DbRouter.prototype.addDestination = function ( database , name ){
    this.destinations[name] = database;
    return this;
}

DbRouter.prototype.findRoute = function ( tiddler ){
    for(var i = this.routes.lengt, route = this.routes[i]; i>-1; --i ) {
        if(route.canRoute(tiddler)){
            return route
        }
    }
}

DbRouter.prototype.route = function(tiddler){
    var route = this.findRoute(tiddler);
    var dest = route.route(tiddler, this.destinations )
    return this.destinations[dest];
}

