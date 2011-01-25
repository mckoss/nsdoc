/*
 Create documentation from a JavaScript namespace.
 */
namespace.lookup('org.startpad.nsdoc').defineOnce(function(ns)
{
    var base = namespace.lookup('org.startpad.base');
    var format = namespace.lookup('org.startpad.format');
    var reArgs = /^function\s+\S*\(([^\)]*)\)/;
    var reComma = /\s*,\s/;

    function functionDoc(name, func) {
        var s = new base.StBuf();
        var level = name.split('.').length;

        s.append(format.repeat('#', level) + ' *' + name + '*(');

        var args = reArgs.exec(func.toString());
        if (args === null) {
            return "error reading function: " + name + '\n';
        }
        args = args[1].split(reComma);
        var sep = '';
        if (args.length > 1 || args[0] != '') {
            s.append('*' + args.join('*, *') + '*');
            sep = ', ';
        }
        if (func.toString().indexOf('arguments') != -1) {
            s.append(sep + '...');
        }
        s.append(')\n');

        name = name[0].toLowerCase() + name.slice(1);
        for (var methodName in func.prototype) {
            if (typeof func.prototype[methodName] == 'function') {
                var method = func.prototype[methodName];
                s.append(functionDoc(name + '.' + methodName, method));
            }
        }

        return s.toString();
    }

    function namespaceDoc(ns) {
        var s = new base.StBuf();

        for (var name in ns) {
            if (ns.hasOwnProperty(name)) {
                var func = ns[name];
                if (typeof func != 'function' || name == '_closure') {
                    continue;
                }

                s.append(functionDoc(name, func));
            }
        }
        return s.toString();
    }

    ns.extend({
        'namespaceDoc': namespaceDoc
    });

});