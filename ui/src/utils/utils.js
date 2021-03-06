// import MD5          from 'md5';

/// General

alert = (() => {});


/// Date

Date.prototype.toDateString = function() {
    return Moment(this).format('MM/DD/YYYY');
};

Date.prototype.toTimeString = function() {
    return Moment(this).format('HH:mm');
};

/// Number

Number.prototype.pad = function(size) {
    var s = "000000000" + this;
    return s.substr(s.length - size);
};

Number.prototype.roundTo = function(digits, fixed) {
    if (digits === undefined) {
        digits = 0;
    }

    var multiplicator = Math.pow(10, digits);
    var result = parseFloat((this * multiplicator).toFixed(11));
    result = (Math.round(result) / multiplicator);

    return (fixed ? result.toFixed(digits) : result);
};


/// String

String.prototype.capitalize = function () {
    return this.toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    });
};

String.prototype.replaceAll = function (find, replace) {
    return this.replace(new RegExp(find, 'g'), replace);
};

String.prototype.removeAll = function (char) {
    return this.replace(new RegExp(char, 'g'), '');
};

String.prototype.camelCaseToDelimiter = function(char) {
    char = char || ' ';
    return this.replace(/([a-z])([A-Z])/g, '$1' + char + '$2');
};

String.prototype.contains = function(search) {
    return this.indexOf(search) != -1;
};

String.prototype.trimLeft = function(charlist) {
    if (charlist === undefined)
        charlist = "\s";

    return this.replace(new RegExp("^[" + charlist + "]+"), "");
};

String.prototype.trimRight = function(charlist) {
    if (charlist === undefined)
        charlist = "\s";

    return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

String.prototype.trim = function(charlist) {
    return this.trimLeft(charlist).trimRight(charlist);
};

String.prototype.toInt = function() {
    return parseInt(this);
};

String.prototype.isDate = function() {
    var date = new Date(this);
    return !(date.toString() == "NaN" || date.toString() == "Invalid Date")
};

String.prototype.isEmail = function() {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(this).toLowerCase());
};

String.prototype.toDate = function() {
    if (this && !this.isDate()) return;
    return new Date(this);
};

String.prototype.cssFriendly = function() {
    return this
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replaceAll('_', '-')
        .replaceAll(' ', '-')
        .replaceAll(':', '-')
        .toLowerCase();
};

String.prototype.toFloat = function() {
    return parseFloat(this);
};

String.prototype.tFriendly = function() {
    return this.extract('_').toUpperCase();
};

// String.prototype.md5 = function() {
//     return MD5(this);
// };

String.prototype.shorten = function(maxLength) {
    var ret = this;
    if (ret.length > maxLength) {
        ret = ret.substr(0,maxLength-3) + "...";
    }
    return ret;
};

String.isEmpty = function(value) {
    if ((typeof value !== 'string') || !(/\S/.test(value))) return true;
    return false;
};

String.random = function(length) {
    length = (length ? length : 5);

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};



/// Array

Array.prototype.clone = function() {
    return this.map(item => item);
};

Array.prototype.empty = function() {
    return this.length == 0;
};

Array.prototype.contains = function(search) {
    return this.indexOf(search) != -1;
};

Array.prototype.containsAny = function(searchArray) {
    return searchArray.first((v) => this.contains(v)) !== undefined;
};

Array.prototype.add = function(object) {
    if (Array.isArray(object)) {
        object.forEach(o => this.push(o));
    }else{
        this.push(object);
    }
};

Array.prototype.remove = function(object) {
    if (Array.isArray(object)) {
        for (var i=0 ; i < object.length ; i++) {
            var idx = this.indexOf(object[i]);

            if (idx > -1) {
                this.splice(idx, 1);
            }
        }
        return;
    }

    var idx = this.indexOf(object);

    if (idx > -1) {
        this.splice(idx, 1);
    }
};

Array.prototype.removeWhere = function(f) {
    var items = this.filter(f);
    this.remove(items);
};


Array.prototype.toggle = function(object) {
    var func = (this.contains(object) ? this.remove : this.push).bind(this);

    func(object);
};


Array.prototype.insert = function(item, index) {
    index = (index ? index : 0);
    return this.splice(index, 0, item);
};

Array.prototype.first = function(f) {
    if (f) {
        return this.filter(f).first();
    }
    return this[0];
};

Array.prototype.any = function(f) {
    if (f) {
        return !!this.filter(f).length;
    }
    return this[0];
};

Array.prototype.all = function(f) {
    var length = this.length;
    for (var index = 0; index < length; index++) {
        var currentKey = index;
        if (!f(this[currentKey], currentKey, this)) return false;
    }
    return true;
};

Array.prototype.last = function(f) {
    if (f) {
        return this.filter(f).last();
    }
    return this[this.length - 1];
};

Array.prototype.sum = function() {
    if (!this.length) return 0;
    return this.reduce((a, b) => a + b);
};

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

Array.prototype.groupBy = function(f) {
    var groups = {};

    this.forEach(function(o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });

    return Object.keys(groups).map(group => groups[group]);
};

Array.prototype.groupByKey = function(f) {
    var groups = {};

    this.forEach(function(o) {
        var group = f(o);
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });

    return groups;
};

Array.prototype.flatten = function(byKey) {
    return this.map(subList => subList[byKey]).reduce((a, b) => a.concat(b));
};

Array.prototype.sortBy = function(by, dir) {
    var temp = this;

    dir = dir || 'ASC';
    dir = dir.toUpperCase();

    temp = temp.sort((a, b) => {
        if (a.data) {
            if (!a.data[by]) return 0;
            if (a.data[by].toLowerCase) {
                if (a.data[by].toLowerCase() < b.data[by].toLowerCase()) return -1;
                if (a.data[by].toLowerCase() > b.data[by].toLowerCase()) return 1;
            }else{
                if (a.data[by] < b.data[by]) return -1;
                if (a.data[by] > b.data[by]) return 1;
            }
        } else {
            if (!a[by]) return 0;
            if (a[by].toLowerCase) {
                if (a[by].toLowerCase() < b[by].toLowerCase()) return -1;
                if (a[by].toLowerCase() > b[by].toLowerCase()) return 1;
            }else{
                if (a[by] < b[by]) return -1;
                if (a[by] > b[by]) return 1;
            }
        }
        return 0;
    });

    if (dir === 'DESC') {
        temp = temp.reverse();
    }

    return temp;
};

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

Array.prototype.uniqueByKey = function(key) {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i][key] === a[j][key])
                a.splice(j--, 1);
        }
    }

    return a;
};

Array.prototype.size = function(f) {
    if (f) {
        return this.filter(f).length;
    }
    return this.length;
};

Array.prototype.isIdentical = function(array) {
    return JSON.stringify(this) == JSON.stringify(array);
};

Array.range = function(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx);
};


/// Object

Object.defineProperty(Object.prototype, 'mergeWith', {
    configurable: true,
    value: function(targetObj) {
        return Object.assign(this, targetObj);
    }
});

Object.defineProperty(Object.prototype, 'deepClone', {
    configurable: true,
    value: function() {
        return JSON.parse(JSON.stringify(this));
    }
});

Object.defineProperty(Object.prototype, 'deepDiff', {
    configurable: true,
    value: function(targetObj) {
        const VALUE_CREATED     = 'VALUE_CREATED';
        const VALUE_UPDATED     = 'VALUE_UPDATED';
        const VALUE_DELETED     = 'VALUE_DELETED';
        const VALUE_UNCHANGED   = 'VALUE_UNCHANGED';

        var isFunction  = function(obj) { return {}.toString.apply(obj) === '[object Function]'};
        var isArray     = function(obj) { return {}.toString.apply(obj) === '[object Array]' };
        var isObject    = function(obj) { return {}.toString.apply(obj) === '[object Object]' };
        var isValue     = function(obj) { return !isObject(obj) && !isArray(obj) };

        var compareValues = function(value1, value2) {
            if (value1 === value2) { return VALUE_UNCHANGED }
            if ('undefined' == typeof(value1)) { return VALUE_CREATED }
            if ('undefined' == typeof(value2)) { return VALUE_DELETED }

            return VALUE_UPDATED;
        };

        var map = function(obj1, obj2) {

            if (isFunction(obj1) || isFunction(obj2)) { throw 'Invalid argument. Function given, object expected.' }

            if (isValue(obj1) || isValue(obj2)) {
                return {
                    type: compareValues(obj1, obj2),
                    data: (obj1 === undefined) ? obj2 : obj1
                };
            }

            var diff = {};

            for (var key in obj1) {
                if (isFunction(obj1[key])) { continue }

                var value2 = undefined;
                if ('undefined' != typeof(obj2[key])) { value2 = obj2[key] }

                diff[key] = map(obj1[key], value2);
            }

            for (var key in obj2) {
                if (isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) { continue }

                diff[key] = map(undefined, obj2[key]);
            }

            return diff;
        };


        var removeUnchanged = function(diffRep) {
            var newDiffRep = {};

            for (var key in diffRep) {
                if (diffRep[key].type != VALUE_UNCHANGED) {
                    newDiffRep[key] = {type: diffRep[key].type};
                    if (isObject(diffRep[key].data)) {
                        newDiffRep[key].data = removeUnchanged(diffRep[key].data);
                    }else{
                        newDiffRep[key].data = diffRep[key].data;
                    }
                }
            }

            return newDiffRep;
        };

        return removeUnchanged(map(this, targetObj));
    }
});

Object.defineProperty(Object.prototype, 'isFunction', {
    configurable: true,
    value: function(obj) { return {}.toString.apply(obj) === '[object Function]'}
});

Object.defineProperty(Object.prototype, 'isIdentical', {
    configurable: true,
    value: function(object) {
        return JSON.stringify(this) == JSON.stringify(object);
    }
});

Object.defineProperty(Object.prototype, 'toObjectArray', {
    configurable: true,
    value: function(keyFieldName) {
        if (!keyFieldName) {
            return Object.keys(this).map(key => this[key]);
        }else{
            return Object.keys(this).map(key => Object.assign(this[key], {[keyFieldName]: key}));
        }
    }
});
