define([
    "seed-js/Seed"
  ], function(Seed){

    var Base = Seed.extend({});

    var clone = function(o) { // clones an object (only lvl 1, see hardClone)
            var res = {};
            for (var i in o) if (o.hasOwnProperty(i)) res[i] = o[i];
            return res;
        },
        extend = function(o) {
            for (var i = 1, n = arguments.length; i < n; i++) {
              var e = typeof(arguments[i]) === "object" || typeof(arguments[i]) === "function" ? arguments[i] : {};
              for (var j in e) if (e.hasOwnProperty(j)) {
                o[j] = e[j];
              }
            }
            return o;
        };
    /**
    * Mix two params, to get the better mix
    *
    * @private
    * @param {String|Array|Object|Number} before
    * @param {String|Array|Object|Number} after
    * @returns an extended object if before and after are objects
    */

    var extendReturn = function(before, after) {

        if(typeof(after) === "undefined") {
            return before;
        }

        if(typeof(after) === "object" && typeof(before) === "object"){
            return extend({}, before, after);
        }

        return after;
    };
    /**
    * Two Fns executed in once
    *
    * @private
    * @param {Object|Function} before a function or object that is executed before
    * @param  {Object|Function} after a function or object that is executed before
    * @returns {Object|Function} a function that calls before and then after
    */

    var mergeFns = function(before, after) {
        if (typeof(before) === "function" || typeof(after) === "function") {
            return function(){
                var beforeR = (typeof(before) === "function" ?
                        before.apply(this, arguments) :
                        before
                    ),
                    afterR  = (typeof(after) === "function" ?
                        after.apply(this, arguments) :
                        after
                    );

                return extendReturn(beforeR, afterR);
            };
        } else {
            return extendReturn(before, after);
        }

    };



    var extendRules = [
        {
            match : /^\+(.*)/g,
            replace : "$1",
            fn : function(extOptions){
                return mergeFns(extOptions.oldFn, extOptions.extFn);
            }
        },
        {
            match : /^\-(.*)/g,
            replace : "$1",
            fn : function(extOptions){
                return mergeFns(extOptions.extFn, extOptions.oldFn);
            }
        },
        {
            match : /^(.*):cached/g,
            replace : "$1",
            extend : {

                "+init" : function(){
                    this.resetCache();
                },

                "resetCache" : function(key){

                    if(!this._cache){
                        this._cache = {};
                    }

                    if(key){
                        this._cache[o.fnName] = null;
                    } else {
                        this._cache = {};
                    }
                },

                "_setCache" : function(o){
                    this._cache[o.fnName] = {
                        result : o.result,
                        err : o.err
                    };

                    if(o.cb){
                        return o.cb(o.err, o.result);
                    } else {
                        if(o.err){
                            throw(o.err);
                        }
                        return o.result;
                    }
                },

                "_getCache" : function(o){
                    if(o.cb){
                        o.cb(this._cache[o.fnName].err, this._cache[o.fnName].result);
                    } else {
                        if(o.err) {
                            throw(this._cache[o.fnName].err);
                        }
                        return this._cache[o.fnName].result;
                    }
                }
            },
            fn : function(extOptions){

                var key = extOptions.key, fn = extOptions.extFn;

                return function(cb){

                    if(
                        arguments.length > 0 &&
                        (typeof(arguments[0]) !== "function" || arguments.length > 1)
                    ){
                        throw("cached function do not take any argument other than one callback");
                    }

                    if(this._cache[key]){
                        return this._getCache({
                            fnName : key,
                            cb: cb
                        });
                    }

                    return fn.call(this,function(err, res){
                        return this._setCache({
                            fnName : key,
                            err : null,
                            cb : cb,
                            result : res
                        });
                    }.bind(this));

                };
            }
        }
    ];



    var validateRule = function(rule){
        for(var i in rule.extend) if(rule.extend.hasOwnProperty(i) && rule.match.test(i)){
            throw("Error with the rule, the extend keys should use the defined rule");
        }
    };

    /**
    * extend an object from extendRules Object configuration
    *
    * @private
    * @param {Object} previousObj an object to extend from
    * @param  {Array} extendObjList a list of key-value objects to add recursively to oldObject applying extend rules, (first item will the first to extend previousObj)
    * @returns {Object} an extended object
    */

    var applyExtendRules = function(previousObj, extendObjList) {

        if(extendObjList.length === 0){
            return previousObj;
        }

        var extendObj = extendObjList.shift(),
            resObj = {},
            nullFn = function(){},
            i, j, matchingRules = {}, isMatching;




        for (i in extendObj) if (extendObj.hasOwnProperty(i)) {
            isMatching = false;

            for(j = 0; j < extendRules.length; j++){
                if(extendRules[j].match.test(i)){

                    isMatching = true;

                    //used to know if we need to extend using extendRules[j].extend
                    matchingRules[j] = true;

                    var key = i.replace(extendRules[j].match, extendRules[j].replace);

                    resObj[key] = extendRules[j].fn({
                        oldFn : previousObj[key] || nullFn,
                        extFn : extendObj[i],
                        extFnName : i,
                        key : key
                    });

                }
            }

            if(!isMatching){
               resObj[i] = extendObj[i];
            }
        }

        for(i in matchingRules) if (matchingRules.hasOwnProperty(i)){
            if(extendRules[i].hasOwnProperty("extend")){
                validateRule(extendRules[i]);
                extendObjList.push(extendRules[i].extend);
            }
        }

        return applyExtendRules(extend(previousObj, resObj), extendObjList);
    };

    /**
    * Extend a Constructor with rules defined
    *
    * @public
    * @param {Object} obj configuration key-value object with "+key" or "-key"
    *
    */

    Base.extend = function(obj) {

        var C = function(o) {
            C["new"].call(C, this, arguments);
        };

        //copy constructor ownProperty (i.e. extend and new)
        var attrs = clone(this);

        for (var i in attrs) if(attrs.hasOwnProperty(i)) {
            C[i] = attrs[i];
        }

        C.prototype = extend(new this(false), applyExtendRules(this.prototype, [obj]));

        return C;
    };

    return Base;

});
