var WSDLElement = require('./wsdlElement');
var QName = require('../qname');

class Service extends WSDLElement {
  constructor(nsName, attrs, options) {
    super(nsName, attrs, options);
    this.ports = {};
  }

  postProcess(definitions) {
    var children = this.children,
      bindings = definitions.bindings;
    if (children && children.length > 0) {
      for (var i = 0, child; child = children[i]; i++) {
        if (child.name !== 'port')
          continue;
        var bindingName = QName.parse(child.$binding).name;
        var binding = bindings[bindingName];
        if (binding) {
          binding.postProcess(definitions);
          this.ports[child.$name] = {
            location: child.location,
            binding: binding
          };
          children.splice(i--, 1);
        }
      }
    }
  }

  describe(definitions) {
    if (this.descriptor) return this.descriptor;
    var ports = {};
    for (var name in this.ports) {
      var port = this.ports[name];
      ports[name] = port.binding.describe(definitions);
    }
    this.descriptor = ports;
    return this.descriptor;
  }

}

Service.elementName = 'service';
Service.allowedChildren = ['port', 'documentation'];

module.exports = Service;
