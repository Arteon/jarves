/*
 * This creates new Mutators at Mootools' Classes to register Controller, Directives, Filter etc
 * to the main jarves angular module.
 */
(function() {
    Class.Mutators.JarvesController = function(controllerName){
        jarves.controller(controllerName, this);
    };

    Class.Mutators.JarvesService = function(serviceName){
        jarves.service(serviceName, this);
    };

    Class.Mutators.JarvesFactory = function(name){
        jarves.factory(name, this);
    };

    Class.Mutators.JarvesFilter = function(name){
        var self = this;
        jarves.filter(name, function() {
            return (new self).filter;
        });
    };

    Class.Mutators.JarvesField = function(name){
        if (this.JarvesDirective) {
            return;
        }

        var directiveName = 'jarves' + name.ucfirst() + 'Field';

        var options = {
            restrict: 'A',
            controller: this,
            scope: true,
            require: [directiveName, 'jarvesField', '?^jarvesField'],
            link: function(scope, element, attr, ctrl) {
                var ownController = ctrl[0];
                var fieldController = ctrl[1];
                var parentFieldController =  ctrl[2];
                scope.controller = ownController;

                fieldController.setController(ownController);
                ownController.setFieldDirective(fieldController);

                if (parentFieldController) {
                    ownController.setParentFieldDirective(parentFieldController);
                }

                ownController.link(scope, element, attr);
            }
        };

        jarves.directive(
            directiveName,
            function() {
                return options;
            }
        );
    };



    Class.Mutators.JarvesLabel = function(name){
        if (this.JarvesDirective) {
            return;
        }

        var directiveName = 'jarves' + name.ucfirst() + 'Label';

        var options = {
            restrict: 'A',
            controller: this,
            scope: true,
            link: function(scope, element, attr, controller) {
                scope.controller = controller;
                controller.link(scope, element, attr);
            }
        };

        jarves.directive(
            directiveName,
            function() {
                return options;
            }
        );
    };

    Class.Mutators.JarvesDirective = function(definition){
        this.prototype.JarvesDirective = definition;

        if (true === definition.options.controller) {
            definition.options.controller = this;
            if (!definition.options.link) {
                definition.options.link = function(scope, element, attr, ctrl) {
                    var ownController;
                    if ('array' === typeOf(ctrl)) {
                        ownController = ctrl[0];
                    } else {
                        ownController = ctrl;
                    }

                    if (ownController && ownController.link) {
                        ownController.link(scope, element, attr, ctrl);
                    }
                };
            }
        }

        var options = 'function' === typeOf(definition.options) || 'array' === typeOf(definition.options)
            ? definition.options
            : function(){ return definition.options; };

        jarves.directive(
            definition.name,
            options
        );
    };
})();