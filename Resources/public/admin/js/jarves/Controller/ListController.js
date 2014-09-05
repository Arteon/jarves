jarves.Controller.ListController = new Class({
    Statics: {
        $inject: ['$scope', '$element', '$attrs', '$q', 'backend', 'objectRepository', 'windowService', 'jarves']
    },
    JarvesController: 'ListController',

    classProperties: null,
    itemsCount: 0,
    items: [],
    currentPage: 1,
    options: {},

    /**
     *
     * @param $scope
     * @param $element
     * @param $attrs
     * @param $q
     * @param backend
     * @param {jarves.Services.ObjectRepository} objectRepository
     * @param {jarves.Services.WindowService} windowService
     * @param {jarves.Services.Jarves} jarves
     */
    initialize: function($scope, $element, $attrs, $q, backend, objectRepository, windowService, jarves) {
        this.scope = $scope;
        this.scope.controller = this;
        this.element = $element;
        this.backend = backend;
        this.objectRepository = objectRepository;
        this.q = $q;
        this.windowService = windowService;
        this.jarves = jarves;
        this.scope.listController = this;
        this.loadClassProperties();
    },

    loadClassProperties: function() {
        this.backend.post(this.getEntryPoint()+'/?_method=options')
            .success(function(response) {
                this.classProperties = response.data;
                this.loadPage();
            }.bind(this))
            .error(function(response){
                this.error = response;
                throw response;
            }.bind(this));
    },

    getEntryPoint: function() {
        return this.options.entryPoint || this.scope.windowInfo.entryPoint.fullPath;
    },

    loadPage: function(page) {
        this.currentPage = page || 1;

        if (!this.itemsCount) {
            this.loadItemCount().then(function () {
                this.loadPage(page);
            }.bind(this));
            return;
        }

        var req = {};
        //this.ctrlPage.value = pPage;
        //
        req.offset = (this.classProperties.itemsPerPage * page) - this.classProperties.itemsPerPage;
        //req.lang = (this.languageSelect) ? this.languageSelect.getValue() : null;
        //
        req.withAcl = true;
        req.order = {};
        //req.order[this.sortField] = this.sortDirection;
        //if (this.actionBarSearchInput) {
        //    req.q = this.actionBarSearchInput.getValue();
        //}

        this.collection = this.objectRepository.newCollection(this.classProperties.object);
        this.collection.setOrder('title');
        this.collection.setEntryPoint(this.getEntryPoint());
        this.collection.setQueryOption('withAcl', true);
        //this.collection.setRepositoryMapping(this.classProperties.objectRepositoryMapping);
        this.collection.setSelection(this.getSelection());
        this.collection.change(function(items) {
            this.items = items;
        }.bind(this));

        this.collection.load({
            offset: (this.classProperties.itemsPerPage * page) - this.classProperties.itemsPerPage,
            limit: this.classProperties.itemsPerPage
        });
    },

    getSelection: function() {
        var selection = [];
        Object.each(this.classProperties.columns, function(column, id) {
            selection.push(id);
            if (column.selected) {
                Array.each(column.selected, function(field) {
                    if (-1 !== selection.indexOf(field)) {
                        selection.push(field);
                    }
                });
            }
        });
        return selection;
    },

    loadItemCount: function() {
        var deferred = this.q.defer();

        var query = {};

        this.backend.get(this.getEntryPoint() + '/:count', query)
            .success(function(response){
                this.itemsCount = response.data;
                deferred.resolve();
            }.bind(this));

        return deferred.promise;
    },

    getSelected: function() {
        return this.selected;
    },

    /**
     *
     * @param {Object} item
     */
    select: function(item) {
        this.selected = this.jarves.getObjectPk(this.classProperties.object, item);
    },

    itemId: function(item) {
        return this.jarves.getObjectPk(this.classProperties.object, item);
    }
});