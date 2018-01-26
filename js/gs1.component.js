// Register `phoneList` component, along with its associated controller and template
function checkDigitCalc(value){
    // #check digit calculation
    var evens = total = 0;
    var newident = value.split("").reverse();
    // console.log(newident);
    var total = 0;
    // console.log(value);
    for (var i=0; i < newident.length; i++){
        var c = newident[i];
        evens += (i % 2) * c;
        total += Number(c);
    }
    return (10 - ((total * 3 - evens * 2) % 10)) % 10
};

function itemRefandIndicator(gtin,compprefix){
    if (!compprefix){
        compprefix = 7;
    }
    if(gtin.length != 14){
        console.log("Invalid GTIN length " + gtin.length);
        return null;
    }

    var _gtin = gtin.split("");

    var Indicator = _gtin[0]
    var CompanyPrefix = _gtin.slice(1,1+compprefix).join("")
    var ItemRef = _gtin.slice(1+compprefix,1+compprefix+5).join("")
    // console.log("GTIN: "+ gtin);
    // console.log("Indicator: "+Indicator)
    // console.log("CompanyPrefix: " + CompanyPrefix)
    // console.log("Item: " + ItemRef)
    var itemWithIndicator = Indicator+ItemRef
    // console.log("ItemRefAndIndicator: " + itemWithIndicator)
    return [CompanyPrefix,itemWithIndicator]
}


function GTIN2LGTIN(gtin, compprefix=7, lot=0, withEPC=true) {
    // console.log(gtin, lot,withEPC, compprefix);
    // var _gtin= gtin.split("");
    itemRefIndicator = itemRefandIndicator(gtin, compprefix);
    // _gtin.pop(); // remove checkdigit;
    if (!itemRefIndicator || itemRefIndicator.length != 2){
        return null;
    }

    var sformat = itemRefIndicator[0]+"."+itemRefIndicator[1]+"."+lot;
    if (withEPC){
        sformat = "urn:epc:class:lgtin:"+sformat
    }
    return sformat;
}

function LGTIN2GTIN(lgtin){
    lgtin=lgtin.replace("urn:epc:class:lgtin:","");
    var compprefix_val = lgtin.substring(0,lgtin.indexOf("."));
    var indicator = lgtin.substring(lgtin.indexOf(".")+1,lgtin.indexOf(".")+2);
    var itemRef = lgtin.substring(lgtin.indexOf(".")+2,lgtin.lastIndexOf("."));
    var short_gtin = ""+indicator+compprefix_val+itemRef;
    return new GTIN(short_gtin+checkDigitCalc(short_gtin));
}

function GLN(value){
    // GLN should have 13 digits
    var self = this;
    self.value = value;
    self.errors = [];

    self.valid = /^([0-9]{13})$/.test(value);
    if (!self.valid){
        self.errors.push("Needs to be 13 digits");
    }
    self.checkdigit = checkDigitCalc(value.slice(0,value.length-1));
    self.valid = (self.checkdigit==self.value[self.value.length-1]);
    if (!self.valid){
        self.errors.push("The checkdigit is invalid should be:"+self.checkdigit+" is: "+self.value[self.value.length-1]);
    }

    self.GLN2SGLN = function(compprefix=7, lot=0, withEPC=true){
        return GLN2SGLN(self.value, compprefix,lot,withEPC);
    };

    self.sgln = self.GLN2SGLN();

    self.valueOf = function(){
        return self.value;
    };

    self.toString = function(){
        return self.value;
    }

    self.valid = (self.errors.length === 0);
    return self;
}


function SGLN(value){
    // GLN should have 13 digits
    var self = this;
    self.value = value;
    self.valueWithoutEPC=value.replace("urn:epc:id:sgln:","");
    self.errors = [];
    // It should be comp_prefix.itemrefindicator.specific
    // comp_prefix+itemref == 12 digits
    // + checkdigit = 13
    var parts = self.valueWithoutEPC.split(".");

    if (value.indexOf("urn")==0 && value.indexOf("urn:epc:id:sgln:")){
        self.errors.push("SGLN should have the correct urn. \"urn:epc:id:sgln:\" ")
    }

    self.valid = (parts.length==3);
    if (!self.valid){
        self.errors.push("Should be in the format compprefix.itemrefindicator.specific {3x .}");
    }

    self.valid = (/^([\d]{12})$/.test(parts[0]+parts[1]));

    if (!self.valid){
        self.errors.push("The first two parts, compprefix.iterefindicator should be 12 digits.")
    }

    self.SGLN2GLN = function(){
        return SGLN2GLN(self.value);
    };
    self.gln = self.SGLN2GLN();

    self.valueOf = function(){
        return self.value;
    };
    self.toString = function(){
        return self.value;
    }
    self.valid = (self.errors.length == 0);
    return self;
}

function GTIN(value){
    // GTIN should be 14 digits
    var self = this;
    self.errors = [];
    self.value = value;
    self.valid = /^([0-9]{14})$/.test(value);
    if (!self.valid){
        self.errors.push("Length should be {14} digits.");
    }


    self.checkdigit = checkDigitCalc(value.slice(0,value.length-1));
    self.valid = (self.checkdigit==self.value[self.value.length-1]);

    if (!self.valid){
        self.errors.push("The checkdigit is invalid should be:"+self.checkdigit+" is: "+self.value[self.value.length-1]);
    }

    self.GTIN2LGTIN = function(compprefix=7, lot=0, withEPC=true){
        return GTIN2LGTIN(self.value, compprefix, lot, withEPC);
    };

    self.lgtin = (self.value.length != 0)? self.GTIN2LGTIN(): "";

    self.valueOf = function(){
        return self.value;
    };
    self.valid = (self.errors.length == 0);

    console.log(self);
    return self;
}

function LGTIN(value){
    // GTIN should be 14 digits
    var self = this;
    self.valueWithoutEPC=value.replace("urn:epc:class:lgtin:","");
    self.errors = [];
    self.value = value;
    var values = self.valueWithoutEPC.split(".");
    self.valid = /^([0-9]{13})$/.test(values[0]+values[1]);

    if(values.length != 3){
        self.errors.push("There should be 3 parts, compprefix.itemRefIndicator.Lot we only have: "+values.length);
    }

    if (!self.valid){
        self.errors.push("Length {compprefix}+{itemRefIndicator} should be {13} digits " +values[0]+values[1]);
    }

    if (value.indexOf("urn")==0 && value.indexOf("urn:epc:class:lgtin:")==-1){
        self.errors.push("LGTIN should have the correct urn. 'urn:epc:class:lgtin:' ")
    }

    self.LGTIN2GTIN = function(){
        return LGTIN2GTIN(self.value);
    };

    self.gtin = self.LGTIN2GTIN();

    self.valueOf = function(){
        return self.value;
    };
    self.valid = (self.errors.length == 0);

    console.log(self);
    return self;
}



function GLN2SGLN(_gln, compprefix=7, lot=0, withEPC=true) {
    // console.log(GLN, lot,withEPC, compprefix);
    var _gln= _gln.split("");
    var sformat = _gln.slice(0,compprefix).join("")+"."+_gln.slice(compprefix,_gln.length-1).join("")+"."+lot;
    if (withEPC){
        sformat = "urn:epc:id:sgln:"+sformat
    }
    _gln.pop(); // remove checkdigit;
    return sformat;
}

//	urn:epc:id:sgln:0050000.00095.0
function SGLN2GLN(_sgln) {
    _sgln=_sgln.replace("urn:epc:id:sgln:","");
    // console.log(sgln)
    var gln= _sgln.split(".").join("").split("");
    gln.pop(); // remove extra "id" digit 0
    gln=gln.join("");
    return new GLN(gln+checkDigitCalc(gln));
}
// var t = "0050000003853"
// var a = GLN2SGLN(t)
// var b = SGLN2GLN(a);
// console.log(t,b);
// console.log(t==b);

// var tg = "00050000073009"
// var a = GTIN2LGTIN(tg)
// var b = LGTIN2GTIN(a);
// console.log(tg,b);
// console.log(tg==b);

angular.
module('phonecatApp',['ngFileUpload','ngTable']).
component('gs1validator', {
    template:
    '<form>' +
    '<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label">Company Prefix</label>' +
        '<div class="col-sm-5">'+
            '<input type="number" class="form-control form-control-sm" ng-model="model.compPrefixLength" placeholder="7">' +
        '</div>' +
    '</div>' +
    '<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label">Checkdigit calculator</label>' +
        '<div class="col-sm-5">'+
            '<input ng-model="model.value"  class="form-control form-control-sm"  type="text">' +
        '</div>' +
        '<span >{{model.checkdigit}}</span>' +
    '</div>' +
    '<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label">GLN to SGLN</label>' +
        '<div class="col-sm-5">'+
            '<input ng-model="model.gln" class="form-control form-control-sm"  type="text" placeholder="0614141008889">' +
        '</div>'+
        '<span >{{model.sgln}}</span>' +
    '</div>'+
    '<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label">GTIN to LGTIN</label>' +
        '<div class="col-sm-5">'+
            '<input ng-model="model.gtin" class="form-control form-control-sm"  type="text" placeholder="10614141073464" >' +
        '</div>' +
        '<span >{{model.lgtin}}</span>'+
    '</div>'+
    '<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label">LGTIN to GTIN</label>' +
        '<div class="col-sm-5">'+
            '<input ng-model="model.lgtin2gtin" class="form-control form-control-sm"  type="text" placeholder="urn:epc:class:lgtin:0614141.107346.101">' +
        '</div>' +
        '<span >{{model.lgtin2gtin_result}}</span>' +
    '</div>' +
    '<div class="form-group row">' +
        '<label class="col-sm-2 col-form-label">SGLN to GLN</label>' +
        '<div class="col-sm-5">'+
            '<input ng-model="model.sgln2gln" placeholder="urn:epc:id:sgln:0614141.00001.0" class="form-control form-control-sm"  type="text">' +
        '</div>' +
        '<span >{{model.sgln2gln_result}}</span>' +
    '</div>' +
    '</form>',
    controller: function PhoneListController($scope, $http) {
        var self = this;
        self.model = {compPrefixLength:7,
            checkdigit:0, value:0,
            gln:0,sgln:0, gtin:0, lgtin:0,
            lgtin2gtin:0,lgtin2gtin_result:0,sgln2gln:0,sgln2gln_result:0};
        $scope.$watch("model.gln", function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.model.sgln = GLN2SGLN(newVal,self.model.compPrefixLength);
            }
        });

        $scope.$watch("model.gtin", function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.model.lgtin = GTIN2LGTIN(newVal,self.model.compPrefixLength);
            }
        });
        $scope.$watch("model.lgtin2gtin", function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.model.lgtin2gtin_result = LGTIN2GTIN(newVal);
            }
        });
        $scope.$watch("model.sgln2gln", function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.model.sgln2gln_result = SGLN2GLN(newVal);
            }
        });

        $scope.$watch("model.value", function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.model.checkdigit = checkDigitCalc(newVal);
            }

        });
    }
}).controller('MyCtrl', ['$scope', 'Upload', '$timeout','$http','NgTableParams',"$interpolate","$sce","$compile",
    function ($scope, Upload, $timeout, $http, NgTableParams,$interpolate, $sce,$compile) {
    var self = $scope;
    self.files= [];
    self.masterDataItem=[];
    self.mdi={};
    self.mdf={};
    self.BMs = {}
    self.masterDataFacility=[];
    self.objectEvents = [];
    self.transformationEvents= [];
    self.aggregationEvents=[];
    self.POs=[];
    self.RAs=[];
    self.DAs=[];
    self.itemsTableParams = new NgTableParams();
    self.aggregationTableParams = new NgTableParams();
    self.transformationTableParams = new NgTableParams();
    self.facilitiesTableParams = new NgTableParams();
    self.objectTableParams = new NgTableParams();
    self.POTableParams = new NgTableParams();
    self.RATableParams = new NgTableParams();
    self.DATableParams = new NgTableParams();
    self.demo = {
        tableParams: new NgTableParams(),
        cols: self.cols = [{
            field: "creationDateTime",
            title: "CreationDateTime",
            show: true,
            getValue: htmlValue
        }, {
            field: "receiver",
            title: "Receiver",
            show: true,
            getValue: GLNfieldValidate
        }, {
            field: "shipper",
            title: "Shipper",
            show: true,
            getValue: GLNfieldValidate
        }, {
            field: "shipTo",
            title: "ShipTo",
            show: true,
            getValue: GLNfieldValidate
        },{
            field: "receivingAdviceIdentification",
            title: "RAIdenfitication",
            show: true,
            getValue: htmlValue
        },{
            field: "despatchAdvice",
            title: "DespatchAdvice",
            show: true,
            getValue: BMfieldValidate
        },{
            field: "receivingAdviceLogisticUnit",
            title: "ReceivingAdviceLogisticUnit",
            show: true,
            getValue: htmlValue
        },{
            field: "opts.filename",
            title: "Filename",
            show: true,
            getValue: htmlValue
        }
        ]
    };
    self.sampleFiles = ["DespatchAdvice_Annotated.xml","EPCIS_Decommission.xml",
        "EPCIS_Transformation.xml",
        "PurchaseOrder_Annotated.xml","EPCIS_Aggregation.xml","EPCIS_Disaggregation.xml",
        "MasterData_Facility_Annotated.xml","ReceiveAdvice_Annotated.xml",
        "EPCIS_Commission.xml","EPCIS_Observation.xml","MasterData_Item_Annotated.xml"];


    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });

    self.runChecks = function runChecks(){
        self.log = {};
    };

    self.updateTables = function updateTables() {
        self.itemsTableParams.settings({
            dataset: self.masterDataItem
        });
        self.facilitiesTableParams.settings({
            dataset: self.masterDataFacility
        });
        self.objectTableParams.settings({
            dataset: self.objectEvents
        });
        self.transformationTableParams.settings({
            dataset: self.transformationEvents
        });
        self.aggregationTableParams.settings({
            dataset: self.aggregationEvents
        });
        self.POTableParams.settings({
            dataset: self.POs
        });
        self.RATableParams.settings({
            dataset: self.RAs
        });
        self.DATableParams.settings({
            dataset: self.DAs
        });
        self.demo.tableParams.settings({
            dataset: self.RAs
        });

        self.runChecks();
    };

        self.loadSample = function(){
            console.log("loading sample data!");
            self.files = self.sampleFiles;
        };

        function htmlValue($scope, row) {
            var value = null;
            if (this.field=="opts.filename"){
                value = row["opts"]["filename"];
            }else{
                value = row[this.field];
            }
            if(typeof value =="object" || typeof value =="array"){
                value = JSON.stringify(value);
            }

            var html = `<span> ${value} </span>`;
            return $sce.trustAsHtml(html);
        }

        function BMfieldValidate($scope, row) {
            var l =
                "<div class='"+(($scope.checkBM(row[this.field]))? 'badge badge-success':'badge badge-danger')+"'>"
                + row[this.field]+
                "</div>";
            return $sce.trustAsHtml(l);
        }


        function GLNfieldValidate($scope, row) {
            var l =
                "<div class='"+(($scope.checkGLN(row[this.field]))? 'badge badge-success':'badge badge-danger')+"'>"
                    + row[this.field]+
                "</div>";
            return $sce.trustAsHtml(l);
        }
    function checkedValue(l){
            return ""
    }
    $scope.checkLGTIN= function(lgtin, row){
        var check = true;

        if (lgtin instanceof LGTIN){
            var registered = self.mdi[lgtin.gtin.value];

            if (!registered){
                log_error(lgtin.gtin.value, "LGTIN "+lgtin.gtin.value+" needs to be registered with a Master Data Item", row.opts);
                check = false;
            }
            if (!lgtin.valid ){
                log_error(lgtin.value,lgtin.errors,row.opts);
                check = false;
            }
        }else{
            console.log("Very invalid LGTIN what's happening");
            check = false;
        }

        return check;
    }

    self.log_length = 0;

    function log_error(key, error, opts){
        var error = error +" in "+ opts.filename;
        if(!self.log[key]){
            self.log[key]={};
            self.log[key][error]=1;
            self.log_length+=1;
        }else if(!self.log[key][error]){
            self.log[key][error]=1;
            self.log_length+=1;
        }
        // self.log[key][error]+=1;
    }

    $scope.checkSGLN= function(sgln, row){
        var check = true;

        if (sgln instanceof SGLN){
            var valid_gln = $scope.checkGLN(sgln.SGLN2GLN(),row);
            var registered = self.mdf[sgln.gln.value];
            var valid_sgln = sgln.valid;

            if (!registered){
                log_error(sgln, "SGLN "+sgln.gln.value+" needs to be registered with a Master Data Facility", row.opts);
                check = false;
            }

            if (!valid_sgln ){
                log_error(sgln.value,sgln.errors,row.opts);
                check = false;
            }
        }else{
            console.log("Very invalid SGLN what's happening");
            check = false;
        }

        return check;
    };

    $scope.checkGLN= function(gln, row){
        var check = true;

        if (gln instanceof GLN){
            var registered = self.mdf[gln.value];
            if (!registered){
                log_error(gln, "GLN "+gln.value+" needs to be registered with a Master Data Facility", row.opts);
                check = false;
            }
            if (!gln.valid ){
                log_error(gln.value,gln.errors,row.opts);
                check = false;
            }
        }else{
            console.log("Very invalid GLN what's happening");
            check = false;
        }

        return check;
    };

    $scope.checkGTIN= function(gtin, row){
        var check = true;

        if (gtin instanceof GTIN){
            var registered = self.mdi[gtin.value];
            if (!registered){
                log_error(gtin.value, "GTIN "+gtin.value+" needs to be registered with a Master Data Item", row.opts);
                check = false;
            }
            if (!gtin.valid ){
                log_error(gtin.value,gtin.errors,row.opts);
                check = false;
            }
        }else{
            console.log("Very invalid GLN what's happening");
            check = false;
        }

        return check;
    };

    $scope.checkBM= function(bmID){
        return bmID && self.BMs[bmID]
    };

    $scope.$watch('self.files', function (newVal, oldVal) {
        if (newVal && oldVal ){
            console.log(newVal.length, oldVal.length);
        }
    });

    self.log = {};

    function MasterDataItem(jXML, opts={}){
        var self = {opts: opts};
        self.gtin = new GTIN(jXML.find("gtin").text().trim());
        self.tradeItemDescription = jXML.find("tradeItemDescription").text().trim();
        self.lgtin = self.gtin.GTIN2LGTIN();
        return self;
    }

    function MasterDataFacility(jXML, opts={}){
        var self = {opts:opts};
        self.gln= new GLN(jXML.find("gln").text().trim());
        self.partyName= jXML.find("partyName").text().trim();
        self.sgln = self.gln.GLN2SGLN();
        return self
    }

        function BaseEvent(jXML, opts={}){
            var self = {opts:opts};
            self.eventTime = jXML.find("eventTime").text().trim();
            self.bizLocation= new SGLN(jXML.find("bizLocation").text().trim());
            self.eventID = jXML.find("eventID").text().trim();

            self.sourceList= [];
            jXML.find("sourceList").find("source").each(function(idx,item){
                self.sourceList.push(new SGLN($(item).text().trim()));
            });
            self.destinationList= [];
            jXML.find("destinationList").find("destination").each(function(idx,item){
                self.destinationList.push(new SGLN($(item).text().trim()));
            });
            return self;
        }


        function ObjectEvent(jXML, opts){
        var self = new BaseEvent(jXML, opts);
        self.action = jXML.find("action").text().trim();
        self.epcList= jXML.find("epcList").text().trim();
        self.quantityList= [];
        jXML.find("quantityList").find("epcClass").each(function(idx,item){
            self.quantityList.push(new LGTIN($(item).text().trim()));
        });
        return self
    }

    function TransformationEvent(jXML, opts){
        var self = new BaseEvent(jXML, opts);
            self.inputEPCList = jXML.find("inputEPCList").text().trim();
            self.inputQuantityList= [];
            jXML.find("inputQuantityList").find("epcClass").each(function(idx,item){
                self.inputQuantityList.push(new LGTIN($(item).text().trim()));
            });
            self.outputEPCList= jXML.find("outputEPCList").text().trim();
            self.outputQuantityList=[];
            jXML.find("outputQuantityList").find("epcClass").each(function(idx,item){
                self.outputQuantityList.push(new LGTIN($(item).text().trim()));
            });

            return self
    }


    function AggregationEvent(jXML, opts){
        var self = new BaseEvent(jXML, opts);
        self.action = jXML.find("action").text().trim();
        self.parentID = jXML.find("parentID").text().trim();
        self.childEPCs= [];
        jXML.find("childEPCs").find("epc").each(function(idx,item){
            self.childEPCs.push($(item).text().trim());
        });
        self.quantityElement=[];
        jXML.find("quantityElement").find("epcClass").each(function(idx,item){
            self.quantityElement.push(new LGTIN($(item).text().trim()));
        });

        return self
    }

    function DespatchAdvice(jXML, opts){
        var self = BusinessMessage(jXML, opts);

        self.receiver = new GLN(jXML.find("receiver").text().trim());
        self.shipper = new GLN(jXML.find("shipper").text().trim());
        self.shipTo = new GLN(jXML.find("shipTo").text().trim());
        self.shipFrom = new GLN(jXML.find("shipFrom").text().trim());
        self.despatchAdviceIdentification = jXML.find("despatchAdviceIdentification>entityIdentification").text().trim();
        self.purchaseOrder=jXML.find("despatchAdvice>purchaseOrder>entityIdentification").text().trim();
        self.despatchAdviceLogisticUnit= [];
            jXML.find("despatchAdviceLogisticUnit").each(function(idx,item){
                identification = $(item).find("logisticUnitIdentification");
                items = [];
                $(item).find("despatchAdviceLineItem").each(function(idx,lineItem)  {
                    items.push(new GTIN($(item).find("transactionalTradeItem").text().trim()));
                })
                self.despatchAdviceLogisticUnit.push({id: identification, items: items});
            });

            if (!self.despatchAdviceIdentification.length){
                self.DA=0;
            }else{
                self.DA=1;
            }

            return self;

    }
    function ReceiveAdvice(jXML, opts){
            var self = BusinessMessage(jXML, opts);
            self.RA=1;

            self.receiver = new GLN(jXML.find("receiver").text().trim());
            self.shipper = new GLN(jXML.find("shipper").text().trim());
            self.shipTo = new GLN(jXML.find("shipTo").text().trim());
            self.despatchAdvice = jXML.find("receivingAdvice>despatchAdvice").text().trim();
            self.receivingAdviceIdentification=jXML.find("receivingAdviceIdentification").text().trim();
            self.receivingAdviceLogisticUnit=[];
            jXML.find("receivingAdviceLogisticUnit").each(function(idx,item){
                identification = $(item).find("logisticUnitIdentification");
                items = [];
                $(item).find("receivingAdviceLineItem").each(function(idx,lineItem)  {
                    items.push(new GTIN($(item).find("transactionalTradeItem").text().trim()));
                })
                self.receivingAdviceLogisticUnit.push({id: identification, items: items});
            });
            return self;
    }

    function PurchaseOrder(jXML, opts){
        var self = BusinessMessage(jXML, opts);
        self.PO=1;
        self.orderIdentification = jXML.find("orderIdentification").text().trim();
        self.orderLineItem= [];
        jXML.find("orderLineItem").find("gtin").each(function(idx,item){
            self.orderLineItem.push(new GTIN($(item).text().trim()));
        });
        self.buyer = new GLN(jXML.find("buyer").text().trim());
        self.seller = new GLN(jXML.find("seller").text().trim());
        self.shipFrom = new GLN(jXML.find("shipFrom").text().trim());
        self.shipTo = new GLN(jXML.find("shipTo").text().trim());

        return self;
    }

    function BusinessMessage(jXML, opts={}){
        var self = {opts: opts};
        self.businessMessage = 1;
        self.creationDateTime = jXML.find("creationDateTime").text();
        return self
    }

    self.processFile = function processFile(xml, opts={}){

        xml.find("tradeItemData").each(function(idx,item){
            // MasterData Item
            var item = new MasterDataItem($(item), opts);
            if (item && item.gtin){
                self.mdi[item.gtin.value]=item;
            }
            self.masterDataItem.push(item);
        });

        xml.find("party").each(function(idx,party){
            // MasterData Facility
            var party = new MasterDataFacility($(party), opts)
            if (party && party.gln){
                self.mdf[party.gln]=party;
            }
            self.masterDataFacility.push(party);
        });

        xml.find("ObjectEvent").each(function(idx,item){
            // MasterData Facility
            self.objectEvents.push(new ObjectEvent($(item),opts))
        });
        xml.find("TransformationEvent").each(function(idx,item){
            // MasterData Facility
            self.transformationEvents.push(new TransformationEvent($(item), opts))
        });
        xml.find("AggregationEvent").each(function(idx,item){
            // MasterData Facility
            self.aggregationEvents.push(new AggregationEvent($(item), opts))
        });

        xml.find("receivingAdvice").each(function(idx,item){
            // MasterData Facility
            var test = new ReceiveAdvice($(item), opts)
            if (test){
                self.RAs.push(test);
                self.BMs[test.receivingAdviceIdentification]=test;
            }
        });
        xml.find("despatchAdvice").each(function(idx,item){
            // MasterData Facility
            if($(item).find("despatchAdviceIdentification").length >0){
                var test = new DespatchAdvice($(item), opts);
                // console.log(test);
                if (test.businessMessage && test.DA){
                    self.DAs.push(test);
                    self.BMs[test.despatchAdviceIdentification]=test;
                }
            }
        });
        xml.find("order").each(function(idx,item){
            var order = new PurchaseOrder($(item), opts);
            self.POs.push(order)
            if(order && order.orderIdentification){
                self.BMs[order.orderIdentification]=order;
            }

        });
        $scope.$apply();
    };
    $scope.upload = function (files) {
        var self = this;
        self.log = {};
        self.log_length=0;
        self.masterDataItem=[];
        self.mdi={};
        self.mdf={};
        self.BMs = {};
        self.masterDataFacility=[];
        self.objectEvents = [];
        self.transformationEvents= [];
        self.aggregationEvents=[];
        self.POs=[];
        self.RAs=[];
        self.DAs=[];
        self.itemsTableParams = new NgTableParams();
        self.aggregationTableParams = new NgTableParams();
        self.transformationTableParams = new NgTableParams();
        self.facilitiesTableParams = new NgTableParams();
        self.objectTableParams = new NgTableParams();
        self.POTableParams = new NgTableParams();
        self.RATableParams = new NgTableParams();
        self.DATableParams = new NgTableParams();
        if (files && files.length) {
            console.log("Processing files:");
            console.log(files);

            $(files).each(function(idx,filename){
                if (typeof(filename)=="string"){
                    $.get("examples/"+filename,function(data){
                        self.processFile($(data), {filename: filename});
                        });
                    }else{
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        // get file content
                        var text = e.target.result;
                        var xml = $.parseXML(text);
                        self.processFile($(xml),{filename: filename.name});
                    };
                    reader.readAsText(filename);
                };
            });
                setTimeout(function() {
                    $scope.message = 'Fetched after two seconds';
                    console.log('message:' + $scope.message);
                    self.updateTables();
                    $scope.$apply();
                }, 1000);
        }
    };
}]);


