/**
 * @author surajit
 * @param {type} global
 * @param {type} $
 * @returns {undefined}
 */
(function (global, $) {

    if (!global) {

        throw "App initialization error";
    }

    if (!ol) {

        throw "Opelayer is not found";
    }

    if (!$) {

        throw "jQuery is not found";
    }


    var base = {};

    global.mapController = base;
    var styleCache = {};

    var fill = new ol.style.Fill({
        color: [255, 0, 0, 0.8]
    });
    var stroke = new ol.style.Stroke({
        color: 'black',
        width: 1.5
    });
    var square = new ol.style.RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        angle: Math.PI / 4
    });
    var star = new ol.style.RegularShape({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: 15,
        radius2: 4,
        angle: 0
    });

    //try {
    styleCache = {
        default: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: [255, 255, 250, 0.8]
                }),
                stroke: new ol.style.Stroke({color: 'red', width: 1.5})
            })
        }),
        shop: new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/shop.png"
            })
        }),
        "residence": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/residence.png"
            })
        }),
        "kalyana mandapam": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/kalyana_mandapam.png"
            })
        }),
        "industrial usage": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/industrial_usage.png"
            })
        }),
        "educational institutions": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/educational_institutions.png"
            })
        }),
        "restarents & lodges": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/restaurents.png"
            })
        }),
        "godowns": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/godowns.png"
            })
        }),
        "hospitals & nursing": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/hospital.png"
            })
        }),
        "cenima theatres": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/cenima_theater.png"
            })
        }),
        "offices & banks": new ol.style.Style({
            image: new ol.style.Icon({
                size: [32, 32],
                src: "http://webgis.sircillamunicipality.in/mapicons/banks.png"
            })
        }),

    };
    //} catch (ex) {
    //   alert(ex);
    //}
    //global.styleCache = styleCache;
    var themeticStyleFunction = function (feature) {

        if (feature) {
            var usage_type = feature.get("building_usage_type") || "default";
            usage_type = usage_type === "null" ? "default" : usage_type;
            usage_type = usage_type.toLowerCase();

            //console.log(usage_type);
            //console.log(styleCache);
            //console.log(styleCache["shops"]);

            return styleCache[usage_type] || styleCache["default"];
        } else {

            //console.log("in not feature")
            return styleCache["default"];
        }

    };




    var plotsurveyNo = "";
    var plotplotNo = "";
    var ploteast = "";
    var plotwest = "";
    var plotnorth = "";
    var plotsouth = "";
    var MAP_BASE_URL = global.appConfig.geoserverURL;
    var GWC_URL = MAP_BASE_URL + global.appConfig.urlGWC;
    var WMS_URL = MAP_BASE_URL + global.appConfig.urlWMS;
    
    var location_For_Search = [];
    //var WMS_URL = "http://199.241.185.218:8080/geoserver/wms";//199.241.185.218

    function init() {


        /*
         * init background layer
         */
        //initBackgroundLayers(); 
    }

    mapLayers = global.layerController.initBackgroundLayers();//Thêm các lớp nền vào map
    let nagoldaLayers = global.layerController.initLayers(global.layersData.nagoldaLayers); //Thêm các lớp nagoldaLayers vào map
    let neopolishLayers = global.layerController.initRasterLayers(global.layersData.neopolish, 'Neopolish Layers'); //thêm các lớp Neopolish vào map
    //let pincode50019Layers = global.layerController.initRasterLayers(global.layersData.pincode500019, 'Layouts');
    let HdmaMasterPlan = global.layerController.initLayers(global.layersData.HMDAMasterPlanZones); //Thêm các lớp HMDA plan zone vào map
    let survey = global.layerController.initSurveyLayer(global.layersData.Survey);//Thêm các lớp survey vào map
    mapLayers = mapLayers.concat(nagoldaLayers, neopolishLayers,HdmaMasterPlan,survey  /*,pincode50019Layers*/)//thêm các lớp vào list mapLayers
    
     //Select All when click group Neopolish layer
    
    function changeVisibleLayer (childLayers, currentVisible) { //Tạo sự kiện nhấp vào checkbox sẽ check các lớp con bên trong
        for (var i = 0; i < childLayers.length; i++) {
            var childLayer = childLayers[i];
            if (currentVisible === true) {
              childLayer.setVisible(true);
            } else {
              childLayer.setVisible(false);
            }
        }
    }
    
    neopolishLayers[0].on('change:visible', (event) => {
        const currentVisible = neopolishLayers[0].getVisible();
        var childLayers = neopolishLayers[0].getLayers().getArray();
        
        changeVisibleLayer(childLayers, currentVisible)
    })
    HdmaMasterPlan[0].on('change:visible', (event) => {
        const currentVisible = HdmaMasterPlan[0].getVisible();
        var childLayers = HdmaMasterPlan[0].getLayers().getArray();
        
        changeVisibleLayer(childLayers, currentVisible)
    })
    
    // pincode50019Layers[0].on('change:visible', (event) => {
    //     const currentVisible = pincode50019Layers[0].getVisible();
    //     var childLayers = pincode50019Layers[0].getLayers().getArray();
        
    //     changeVisibleLayer(childLayers, currentVisible)
    // })
    //Set Zindex for HMDA Master Zones
    // var listHMDA =['Masterplan Boundary','111 GO Land Use','Manufacturing Land Use','Commerical Land Use','Residentital Use Zone'];
    // var layerHMDA = HdmaMasterPlan[0].getLayers().getArray();
    // listHMDA.forEach(function(layerName, index) {
    //     var layer = layerHMDA.find(layer => layer.get('title') === layerName);
    //     if (layer) {
    //         HdmaMasterPlan[0].getLayers().setZIndex(index);
    //     }
    // });
    
    
    
    var sourceGeomBuilding = new ol.source.Vector();//Tạo một lớp vector Legend
    base.sourceGeomBuilding = sourceGeomBuilding;//Không biết mục đích làm gì
    var geomBuilding = new ol.layer.Vector({
        title: "Legend",
        source: sourceGeomBuilding,
        zIndex: 1
    });
    
   

    /*
     var resultlayerSource = new ol.source.Vector();
     var resultVectorLayer = new ol.layer.Vector({
     title: "Filter results",
     source: resultlayerSource,
     //style: themeticStyleFunction,
     zIndex: 1
     });
     
     base.resultVectorLayer = resultVectorLayer;
     mapLayers.push(resultVectorLayer);
     */

    //making it static for now
    /*
     function getQueryParams(qs) {
     qs = qs.replace(/\+/g, " ");
     var params = {},
     re = /[?&]?([^=]+)=([^&]*)/g,
     tokens;
     
     while (tokens = re.exec(qs)) {
     params[decodeURIComponent(tokens[1])]
     = decodeURIComponent(tokens[2]);
     }
     
     return params;
     }
     */


    /*var resultRasterlayerSource = new ol.source.TileWMS({
        url: WMS_URL,
        params: {
            layers: ["municipalservce:yadadri_choutuppal_kaitapur"],
            STYLES: ["polygon_query_style"], //["polygon_style"],
            tile: true,
        },
        serverType: 'geoserver'
    });

    var resultWMSLayer = new ol.layer.Tile({
        title: "Filter results",
        source: resultRasterlayerSource,
        zIndex: 1
    });

    base.resultWMSLayer = resultWMSLayer;
    mapLayers.push(resultWMSLayer);*/
//    console.log(geomBuilding);
    mapLayers.push(geomBuilding);
    
    var mapView = new ol.View({// xây dựng view bản đồ theo dữ liệu từ file appConfig
        projection: global.appConfig.mapProjection,
        // center: global.appConfig.defaultCenter,
        zoom: global.appConfig.defaultZoom,
        minZoom: global.appConfig.minZoom,
        maxZoom: global.appConfig.maxZoom
    });
    
    var map = new ol.Map({
        target: 'map',//gán Map cho element id map
        pixelRatio: 1,//Đặt tỉ lệ pixel cho bản đồ
        view: mapView,//gán view từ view được thiết lập phía trên
        layers: mapLayers,//Thêm các lớp bản đồ vào
        interaction: ol.interaction.defaults.defaults(),//Các chức năng tương tác với bản đồ là mặc định
        controls: ol.control.defaults.defaults().extend//Thêm các controll vào 
                ([
                    // new ol.control.ScaleLine(),
                    // new ol.control.OverviewMap({
                    //     collapse: false
                    // }),
                    new ol.control.LayerSwitcher(),
                    new ol.control.ZoomSlider(),
                    new ol.control.FullScreen(),
                ])

    });
    
    
    
 
    async function getDataFromGeoserver(evt, layerName) { //hàm này không được sử dụng trong web
        var dataReturn;
        await $.ajax({
            url: MAP_BASE_URL + '/gis/wms?',//lấy dữ liệu từ geoserver qua gọi api geojson
            type: 'GET',
            dataType: 'json',
            data: {
                'SERVICE': 'WMS',
                'VERSION': '1.1.1',
                'REQUEST': 'GetFeatureInfo',
                'LAYERS': layerName,
                'QUERY_LAYERS': layerName,
                'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': 50,
                'X': Math.round(evt.pixel[0]),
                'Y': Math.round(evt.pixel[1]),
                'SRS': 'EPSG:3857',
                'WIDTH': map.getSize()[0],
                'HEIGHT': map.getSize()[1],
                'BBOX': map.getView().calculateExtent().join(','),
            },
            success: function (data) {
                if (data.features.length > 0) {
                    var featureData = data.features[0].properties;
                    dataReturn = featureData;
                }
                return dataReturn;
            }
        });
        return dataReturn;
    }

    function callApiUpdateBuldingStyle(idList) {//hàm này không được sử dụng
        $u.ajaxRequest('POST', 'https://webgis.proper-t.co/' + 'php/updateBuildingStyle.php', { "ids": idList.join("_"), "_timestamp": (new Date()).getTime() }, function (responseInner) {
            if (responseInner.message.status && responseInner.message.status == "success") {
                // GISApp.layerController.layers["propert:public.Parcel"].getSource().updateParams({
                //     STYLES: ["propert:polygon_query_style"],
                //     timestamp: (new Date()).getTime()
                // })
                var dataBbox = responseInner.message.bbox;
                var inforDiv = document.getElementById('gis_informations');
                inforDiv.textContent = dataBbox;
            }
        })
    }//Hàm này được gọi để lấy các style building trong api
    
    function getFeatureByClick(evt, layername) {//Lấy Feature khi click vào bản đồ
        var pixel = evt.map.getEventPixel(evt.originalEvent);//lấy sự kiện khi nhấp vào pixel đó trên bản đồ
        var placeSearchFeature = getFeatureForLayer(pixel, layername)//gọi hàm lấy feature tại vị trí pixel
        return placeSearchFeature //trả về feature hoặc undefine
    }
    
    function getFeatureForLayer(pixel, layername) {//Lấy feature từ layer đó ra
        return map.forEachFeatureAtPixel(pixel,  //lặp qua tất cả các đối tượng feature ở vị trí pixel đã cho
            function(feature) {//nếu đúng trả về feature
                return feature;
            },
            {
                layerFilter: function (layer) {
                    return layer.getProperties().name === layername;
                }
            }//nếu sai trả về undefined
        );
    }
    
    function setPopupLocation(coor) {//hàm zoom đến và hiển thị popup ở vị trí center
        let zoom = map.getView().getZoom();//lấy zoom và view của map ở vị trí hiện tại
        let change = zoom < 10 ? 20000 //nếu zoom nhỏ hơn 10 thì change được gán với 20000
                    : zoom < 12 ? 8000//
                    : zoom < 14 ? 2000//
                    : zoom < 15 ? 800//
                    : zoom < 16 ? 500//
                    : 100//còn lại
        mapView.setCenter([coor[0], coor[1] + change])//set center đến vị trí của popup
    }
    
    function clearSearchInput() {//clear tất cả giá trị trong input
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';
    }
    
    function showSearchInput() {//hiển thị ô gg search
        $("#google-search-input").removeClass("hide-search");
        $("#google-search-input").toggleClass("show-search");
    }
    
    map.on('singleclick', async (evt) => { //tạo sự kiện nhấp vào map
        global.placeCard.hideCard();//chạy hàm ẩn card
        global.popupController.hidePopup();//Chạy hảm ẩn popup
        showSearchInput();//hiển thị khung search
        clearSearchInput();//Clear hết nội dung trong khung input
        
        location_For_Search = evt.coordinate;//lấy coordinate tạo vị trí search
        GISApp.googleSearchController.setMap(map);//set map để sử dụng gg search API
        GISApp.googleSearchController.setLocationForSearch(location_For_Search);
        GISApp.layerController.removeLayer('Point-Clicked', map);//remove Point-clicked
        
        var metroFeature = getFeatureByClick(evt, 'Metro Location');//lẩy ra feature tại điểm click
        var buildingFeature = getFeatureByClick(evt, 'Survey Point');
        var placeSearchFeature = getFeatureByClick(evt, 'Point-Searched');
        // var metroData = await getDataFromGeoserver(evt, "Metro_locations");
        
        if (metroFeature) {    //nếu tại điểm click tồn tại metroFeature
            var metroName = metroFeature.get('name');
            global.metroCard.removeCard(metroName);
            global.metroCard.initCard(map, metroName, evt.coordinate);    //thêm popup ở điểm click
            return;
        }
        
        if (buildingFeature) {    //nếu tại điểm click có chứa building Feature
            var features = buildingFeature.get('features');
            
            if (features.length > 1) return; //nếu tại điểm đó là icon cluster return none
            
            var gis_id = features[0].get('gis_id');//nếu điểm đó bằng 1 thì sẽ lấy dữ liệu từ trường đó để hiển thị popup
            //await setPopupLocation(location_For_Search)
            
            global.popupController.showPopup(evt.coordinate, [gis_id]);
            
            return;
        }
        
        if (placeSearchFeature) {    //nếu điểm click là điểm search từ google API thì hiển thị card
            
            var placeId = placeSearchFeature.get('place_id');
            await setPopupLocation(location_For_Search)
            
            global.placeCard.showCard(evt.coordinate, placeId);
            return;
        };
        
        var idList = [];
        
        var url = apiUrl+"/surveyor/webgis/handle-click-on-map";    //gọi api để lấy ra được uniq_id tại điểm click
        var csrfToken = $('#csrf-token').attr('content');
        
        await $u.ajaxRequest('POST', url,
            {"_token":csrfToken,"lat": location_For_Search[0], "lng": location_For_Search[1]}, function (responseInner) {
                if (responseInner.status && responseInner.status == true) {
                    try {
                        var result = responseInner.message;
                        result.forEach((data) => {
                            idList.push(data.uniq_id)//lặp qua data sau đó gán data và idList
                        })
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        );
        global.popupController.showPopup(evt.coordinate, idList); //hiển thị popup với idList

        if (idList.length !== 0) {    //Không được sử dụng
            // callApiUpdateBuldingStyle(idList);
        } else {        //nếu không nằm trong bất cứ feature nào thì sẽ hiển thị điểm point-clicked
            var coor = evt.coordinate;    //lấy ra toạ độ điểm click (location_for_search)
            var coor4326 = ol.proj.transform(coor,'EPSG:900913', 'EPSG:4326');
            var point = new ol.Feature({    //tạo một feature tại điểm click
                geometry: new ol.geom.Point(coor),
                label: `${coor4326[0]} , ${coor4326[1]}` //tạo label
            });

            global.popupController.hidePopup(); //ẩn popup đang hiển thị
            GISApp.layerController.addPointClickedLayer(map, point);    //thêm một điểm click mới
        }
    });
    
    map.on('pointermove', (evt) => {    //sự kiện di chuyển chuột vào đối tượng
        GISApp.layerController.removeLayer('Label', map);//gỡ các label hiện tại ra khỏi map
        GISApp.layerController.removeLayer('Highlight', map);    //gỡ các hightlight hiện tại ra khỏi map
        
        var layerVector = ['ORR Boundary', 'RRR', 'Metro Proposed Line', 'Link Road']; //tạo một list gồm các layer hiển thị hightlight khi hover vào
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature; //lấy ra feature khi hover vào điểm đó
        });
    
        if (feature) {    //nếu feature tồn tại
            if (layerVector.includes(feature.get('title'))) { //lấy ra đối tượng có tile nằm trong list layerVector
                
                var label = feature.get('name');    //lấy ra name của feature
                var mouseCoords = evt.coordinate;    //toạ độ chuột
                var hoverFeature = feature.clone();    //tạo một bản sao của lớp feature đó
                
                GISApp.layerController.addLabelLayer(map, label, hoverFeature, mouseCoords)    //thêm lable tại điểm chuột
                GISApp.layerController.addHighlightLineLayer(map, hoverFeature)    //hightlight đối tượng được thêm vào
                
            }
        } else {    //nếu điểm chuột không có feature thì gỡ các lớp lable
            GISApp.layerController.removeLayer('label', map);
        }
    });
    
    // Handle Show Metro Popup
    var metroLayers = global.layerController.layers['propert:public.metro_locations']; //lấy layer metro_locations
    var metroSource = metroLayers.getSource(); //lấy source của lớp metro_locations
    var metroFeatures = [];
    
    metroSource.on('addfeature', function (event) { //khi sự kiện thêm lớp metro được diễn ra thì push các đối tượng vào list metroFeatures
        var feature = event.feature;
        metroFeatures.push(feature);
    });
    
    metroLayers.on('change:visible', function(event) {    //bắt sự kiện khi bật visible cho lớp metro_locations
        setTimeout(() => {
            var isVisible = metroLayers.getVisible();
    
            if (isVisible) {    //nếu visible được bật (true)
                metroFeatures.forEach(function(feature) {    //lặp qua các feature trong metroFeatures
                    var coordinate = feature.getGeometry().getCoordinates();    //lấy ra toạ độ của những feature
                    var name = feature.get('name');    //lấy ra name của feature
                    global.metroCard.initCard(map, name, coordinate);    //hiển thị init card của lớp metro
                });
            } else {    //ngược lại nếu tắt lớp metro_locations thì sẽ lặp qua để tắt các card 
                metroFeatures.forEach(function(feature) {
                    var name = feature.get('name');
                    global.metroCard.removeCard(name);
                });
            }
        }, 1000)
    });
    
    //  Start Live Location Feature //lấy toạ dộ vị trí hiện tại của người dùng
    var intervalAutoLocate;

    var geolocation = new ol.Geolocation({    //sử dụng geolocation để lấy toạ độ người dùng
        trackingOptions: {
            enableHighAccuracy: true, //được sử dụng để yêu cầu việc theo dõi vị trí với độ chính xác cao, được hoạt động như GPS
        },
        tracking: true,
        projection: mapView.getProjection(), //gán hệ toạ độ cho vị trí người dùng
    });

    var positionFeature = new ol.Feature();    //tạo một feature mới để hiển thị vị trí của người dùng lên bản đồ

    positionFeature.setStyle(    //setStyle cho vị trí người dùng
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#3399CC',
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2,
                }),
            }),
        })
    );

    var accuracyFeature = new ol.Feature();    //tạo một feature là buffer bên ngoài của vị trí người dùng

    var currentPositionLayer = new ol.layer.Vector({    //tạo một lớp vector để hiển thị lên map
        map: map,
        source: new ol.source.Vector({
            features: [accuracyFeature, positionFeature],//thêm 2 feature phía trên vào map
        }),
    });

    function handleAutoLocate(coordinates) { //hàm này được gọi để set vị trí cho 2 feature được tạo phía trên
        positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);    //nếu vị trí được bật thì sẽ thêm vị trí hiển thị lên bản đồ
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());//tạo một vùng buffer xung quanh vị trí người dùng
        mapView.setCenter(coordinates);//zoom đến vị trí người dùng
        mapView.setZoom(16);
    }
    
    
    


    async function startAutoLocate(formData) {    //hàm được sử dụng khi bắt đầu bật vị trí người dùng
        global.placeCard.hideCard();//ẩn tất cả các card đang hiển thị
        global.popupController.hidePopup();//tắt các popup
        GISApp.layerController.removeLayer('Point-Searched', map);      //gỡ các lớp point search, point clicked
        GISApp.layerController.removeLayer('Point-Clicked', map);
        const searchResults = document.getElementById('search-results');//xoá các input được nhập vào trong ô
        searchResults.innerHTML = '';
        
        $("#google-search-input").removeClass("hide-search");    //có thể bỏ
        $("#google-search-input").toggleClass("show-search");    //thêm class google search input
        // GISApp.layerController.resetInitMap(map);
        GISApp.layerController.clearSurveyAndNonSurveyLayer(map);
        location_For_Search = geolocation.getPosition();//lấy ra toạ độ vị trí người dùng
        if(location_For_Search!=undefined){    //nếu toạ độ được bật
            GISApp.googleSearchController.setLocationForSearch(location_For_Search);//set vị trí của google search
            await handleAutoLocate(location_For_Search);//Hàm hiển thị lên vị trí người dùng
            searchFeature(formData, location_For_Search);//lấy dữ liệu tại điểm xung quanh người dùng
        }else{    //nếu toạ đồ không được bật
            alert("Please share the location and reload the page!");//thông báo cho người dùng bật vị trí
            setTimeout(function() {
                const button = document.getElementById('btnCrosshair');
                button.click();
                searchFeature(formData,[8721661.991552157, 1974824.6367594642]);//chạy hàm để hiển thị lại vị trí mặc định
                },300)
        }
        // location_For_Search = [8715659.118891492, 1973895.075943143];
    };
    
    function stopAutoLocate() { //tắt vị trí của người dùng
        // $("#google-search-input").removeClass("show-search");
        // $("#google-search-input").toggleClass("hide-search");
        clearInterval(intervalAutoLocate);//có thể bỏ
        positionFeature.setGeometry(null);//set null cho 2 feature để ẩn vị trí người dùng
        accuracyFeature.setGeometry(null);
    };
    //  End Live Location Feature


    global.placeCard.initCard(map);    //tạo overlay phủ lên trên map
    global.popupController.initPopup(map);    //tạo overlay phủ lên trên map

    base.map = map;//thêm map vào base
    base.view = map.getView();//thêm view vào base


    // var olGM = new olgm.OLGoogleMaps({map: map}); // map is the ol.Map instance
    // olGM.activate();

    // base.olGM = olGM;

    var mainbar = new ol.control.Bar();//tạo một thanh chứa các control
    map.addControl(mainbar);//thêm vào control
    var nested = new ol.control.Bar({toggleOne: true, group: true});//thêm một thanh chứa các button, thanh này chỉ cho phép một button được bật

    let infoControl = global.infoOnClick.getInstance();//chỗ này không có tác dụng


    global.infoControl = infoControl;

    nested.addControl(infoControl);    //thêm button infoControl vào

    var dragCtrl = new ol.control.Toggle(
            {html: '<i class="fa fa-hand-pointer-o"></i>',
                className: "select",
                title: "Select",
                interaction: new ol.interaction.DragPan(),
                active: true
            });
    nested.addControl(dragCtrl);

    mainbar.setPosition("left")
    mainbar.addControl(nested);
    mainbar.addControl(new ol.control.ZoomToExtent({extent: global.appConfig.defaultExtent}));
    mainbar.addControl(new ol.control.Rotate());
    mainbar.addControl(new ol.control.FullScreen());//thêm các button vào trong mainbar

    //activating info control by default
    infoControl.setActive(true);//set trạng thái đang bật

    var house_no;
    var gis_id;
    var assnn_no;

    $("#tabs-nei-open").click(function () {
        var htmlplotneighbours = "";
        if ($("#tabs-9").html().length > 0)
            return;

        $("#tabs-9").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
        if ((ploteast != "") && (plotwest != "") && (plotnorth != "") && (plotsouth != ""))
        {
            htmlplotneighbours += '<div style="height:450px; overflow:scroll;"><table style="font-size:12px;" border="1" class="tbencumbrace table"';
            htmlplotneighbours += '<tr><th>East<br/>(à°¤à±‚à°°à±à°ªà±)</th>';
            htmlplotneighbours += '<th>West<br/>(à°ªà°¶à±à°šà°¿à°®)</th>';
            htmlplotneighbours += '<th>North<br/>(à°‰à°¤à±à°¤à°°)</th>';
            htmlplotneighbours += '<th>South<br/>(à°¦à°•à±à°·à°¿à°£)</th></tr>';
            if (ploteast != "")
            {
                htmlplotneighbours += "<tr><td>" + ploteast + "</td>";
            } else
            {
                htmlplotneighbours += "<tr><td>Record Not found</td>";
            }
            if (plotwest != "")
            {
                htmlplotneighbours += "<td>" + plotwest + "</td>";
            } else
            {
                htmlplotneighbours += "<tr><td>Record Not found</td>";
            }
            if (plotnorth != "")
            {
                htmlplotneighbours += "<td>" + plotnorth + "</td>";
            } else
            {
                htmlplotneighbours += "<tr><td>Record Not found</td>";
            }
            if (plotsouth != "")
            {
                htmlplotneighbours += "<td>" + plotsouth + "</td></tr>";
            } else
            {
                htmlplotneighbours += "<tr><td>Record Not found</td>";
            }

            htmlplotneighbours += '</table></div>';
            $("#tabs-9").empty();
            $("#tabs-9").append(htmlplotneighbours);


        } else
        {
            htmlplotneighbours += '<div style="height:450px; overflow:scroll;">No data fetched for the door number</div> ';
            htmlplotneighbours += '</table></div>';
            $("#tabs-9").empty();
            $("#tabs-9").append(htmlplotneighbours);
        }
    });

    $("#tabs-enc-open").click(function () {
        var htmlplotEncumbrace = "";
        if ($("#tabs-10").html().length > 0)
            return;

        $("#tabs-10").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
        var urlDestination = "php/getplotMutationServices.php";

        $u.ajaxRequest('GET', urlDestination, "surveyNo=" + plotsurveyNo + "&plotNo=" + plotplotNo,
                function (response) {

                    if (response.message.EODB1 && response.message.EODB1[0].length > 1) {

                        htmlplotEncumbrace += '<div style="height:450px; overflow:scroll;"><table style="font-size:12px;" border="1" class="tbencumbrace table"';
                        htmlplotEncumbrace += '<tr><th>Sl.No<br/>(à°•à±à°°. à°¸à°‚)</th>';
                        htmlplotEncumbrace += '<th>Description of property<br/>(à°¸à±à°¥à°¿à°°à°¾à°¸à±à°¤à°¿ à°µà°¿à°µà°°à°¾à°²à±)</th>';
                        htmlplotEncumbrace += '<th>Exe.Date<br/>(à°…à°®à°²à± à°¤à±‡à°¦à±€)</th>';
                        htmlplotEncumbrace += '<th>Nature & Mkt.Value Con. Value<br/>(à°µà°¿à°§à°®à± & à°µà°¿à°ªà°£à°¿ à°µà°¿à°²à±à°µ, à°ªà°°à°¿à°—à°£à°¿à°‚à°ª à°¬à°¡à°¿à°¨ à°µà°¿à°²à±à°µ)</th>';
                        htmlplotEncumbrace += '<th>Name of Parties Executant(EX) & Claimants(CL)<br/>(à°‡à°šà±à°šà± (EX) à°®à°°à°¿à°¯à± à°ªà±Šà°‚à°¦à± (CL) à°µà°¾à°°à°¿ à°µà°¿à°µà°°à°¾à°²à±)</th>';
                        htmlplotEncumbrace += '<th>Vol/Pg No CD No Doct No/Year [ScheduleNo]<br/>(à°ªà±‡à°œà±€/à°•à±à°°à°® à°²à±‡à°¦à°¾ à°œà°¾à°¬à°¿à°¤à°¾ à°¸à°‚à°–à±à°¯/à°¸à°‚à°µà°¤à±à°¸à°°à°‚)</th>';

                        var j = 1;
                        for (i = 0; i < response.message.EODB1[0].length - 1; i++) {
                            var data = response.message.EODB1[0][i];
                            htmlplotEncumbrace += "<tr><td>" + j + "</td>";
                            htmlplotEncumbrace += "<td class='mytable'>" + data.village + " " + data.propertyDetails + "Link Doct:" + data.ldoctNo + "/" + data.lregYr + "of SRO " + data.t_sro + "</td>";

                            htmlplotEncumbrace += "<td>" + data.execdate + "</td>";
                            htmlplotEncumbrace += "<td>" + data.transcode + "" + data.transdesc + "" + data.marketRate + "" + data.considerationValue + "</td>";
                            htmlplotEncumbrace += "<td>" + data.partyNames + "</td>";
                            htmlplotEncumbrace += "<td>0/0" + data.cdNo + "" + data.t_doct + "/" + data.t_regyr + "[" + data.t_sch + "] of SRO" + data.srName + "(" + data.t_sro + "</td></tr>";

                            j++;

                        }

                        htmlplotEncumbrace += '</table></div>';
                        $("#tabs-10").empty();
                        $("#tabs-10").append(htmlplotEncumbrace);


                    } else
                    {
                        htmlplotEncumbrace += '<div style="height:450px; overflow:scroll;">No data fetched for the door number</div> ';
                        htmlplotEncumbrace += '</table></div>';
                        $("#tabs-10").empty();
                        $("#tabs-10").append(htmlplotEncumbrace);
                    }





                },
                function () {

                    var n = noty({
                        text: 'Error warning!',
                        type: 'error',
                        animation: {
                            open: {height: 'toggle'},
                            close: {height: 'toggle'},
                            easing: 'swing',
                            speed: 2000 // opening & closing animation speed
                        }
                    });
                    n.close();
                }

        );

//        $.ajax({
//            type: 'GET',
//            url: urlDestination,
//            data: "surveyNo=" + plotsurveyNo + "&plotNo=" + plotplotNo,
//            success: ,
//            error: 
//        });

    });

    $(function () {
        $("#floor_accordion").accordion();
        $("#dispute_accordion").accordion();
        $("#prohib_accordion").accordion();
        $("#tabs").tabs();
        $("#tabs-open-plot").tabs();
        $(".close-button").click(function () {
            $("#box-info-building").css("visibility", "hidden");
            $("#box-info-open-plot").css("visibility", "hidden");
        });

        $("#tabs-2").click(function () {
            $("#floor_accordion").accordion("refresh");
        });
        $("#tabs-3").click(function () {
            $("#dispute_accordion").accordion("refresh");
        });
        $("#tabs-6").click(function () {
            $("#prohib_accordion").accordion("refresh");
        });

        $("#tabs-enc").click(function () {
            var htmlEncumbrace = "";
            if ($("#tabs-4").html().length > 0)
                return;

            $("#tabs-4").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
            var urlDestination = "php/getMutationServices.php";

            $u.ajaxRequest('GET', urlDestination, "house_no=" + house_no, function (response) {

                if (response.message.EODB1 && response.message.EODB1[0].length > 1) {

                    htmlEncumbrace += '<div style="height:450px; overflow:scroll;"><table style="font-size:12px;" border="1" class="tbencumbrace table"';
                    htmlEncumbrace += '<tr><th>Sl.No<br/>(à°•à±à°°. à°¸à°‚)</th>';
                    htmlEncumbrace += '<th>Description of property<br/>(à°¸à±à°¥à°¿à°°à°¾à°¸à±à°¤à°¿ à°µà°¿à°µà°°à°¾à°²à±)</th>';
                    htmlEncumbrace += '<th>Exe.Date<br/>(à°…à°®à°²à± à°¤à±‡à°¦à±€)</th>';
                    htmlEncumbrace += '<th>Nature & Mkt.Value Con. Value<br/>(à°µà°¿à°§à°®à± & à°µà°¿à°ªà°£à°¿ à°µà°¿à°²à±à°µ, à°ªà°°à°¿à°—à°£à°¿à°‚à°ª à°¬à°¡à°¿à°¨ à°µà°¿à°²à±à°µ)</th>';
                    htmlEncumbrace += '<th>Name of Parties Executant(EX) & Claimants(CL)<br/>(à°‡à°šà±à°šà± (EX) à°®à°°à°¿à°¯à± à°ªà±Šà°‚à°¦à± (CL) à°µà°¾à°°à°¿ à°µà°¿à°µà°°à°¾à°²à±)</th>';
                    htmlEncumbrace += '<th>Vol/Pg No CD No Doct No/Year [ScheduleNo]<br/>(à°ªà±‡à°œà±€/à°•à±à°°à°® à°²à±‡à°¦à°¾ à°œà°¾à°¬à°¿à°¤à°¾ à°¸à°‚à°–à±à°¯/à°¸à°‚à°µà°¤à±à°¸à°°à°‚)</th>';

                    var j = 1;
                    for (i = 0; i < response.message.EODB1[0].length - 1; i++) {
                        var data = response.message.EODB1[0][i];
                        htmlEncumbrace += "<tr><td>" + j + "</td>";
                        htmlEncumbrace += "<td class='mytable'>" + data.village + " " + data.propertyDetails + "Link Doct:" + data.ldoctNo + "/" + data.lregYr + "of SRO " + data.t_sro + "</td>";

                        htmlEncumbrace += "<td>" + data.execdate + "</td>";
                        htmlEncumbrace += "<td>" + data.transcode + "" + data.transdesc + "" + data.marketRate + "" + data.considerationValue + "</td>";
                        htmlEncumbrace += "<td>" + data.partyNames + "</td>";
                        htmlEncumbrace += "<td>0/0" + data.cdNo + "" + data.t_doct + "/" + data.t_regyr + "[" + data.t_sch + "] of SRO" + data.srName + "(" + data.t_sro + "</td></tr>";

                        j++;

                    }

                    htmlEncumbrace += '</table></div>';
                    $("#tabs-4").empty();
                    $("#tabs-4").append(htmlEncumbrace);


                } else
                {
                    htmlEncumbrace += '<div style="height:450px; overflow:scroll;">No data fetched for the door number</div> ';
                    htmlEncumbrace += '</table></div>';
                    $("#tabs-4").empty();
                    $("#tabs-4").append(htmlEncumbrace);
                }





            }, function () {
                var n = noty({
                    text: 'Error warning!',
                    type: 'error',
                    animation: {
                        open: {height: 'toggle'},
                        close: {height: 'toggle'},
                        easing: 'swing',
                        speed: 2000 // opening & closing animation speed
                    }
                });
                n.close();
            })

//            $.ajax({
//                type: 'GET',
//                url: urlDestination,
//                data: "house_no=" + house_no,
//                success: ,
//                error: 
//            });

        });

        $("#tabs-nei").click(function () {

            if ($("#tab1primary").html().length > 0)
                return;
            var htmlEncumbrace = "";

            $("#tab1primary").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
            $("#tab2primary").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
            $("#tab3primary").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
            $("#tab4primary").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
            var urlDestination = "php/getNeighborBuilding.php";

            $u.ajaxRequest('GET', urlDestination, "gis_id=" + gis_id, function (response) {

                if (response.status) {
                    var nei_style = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'orange',
                            lineDash: [4],
                            width: 4
                        })
                    })
                    var htmlNorthBuilding = "";
                    var htmlEastBuilding = "";
                    var htmlSouthBuilding = "";
                    var htmlWestBuilding = "";
                    if ($.trim(response.message.north_building)) {

                        var summarydata = response.message.north_building;
                        htmlNorthBuilding += '<table width="100%" border="1" cellspacing="0" cellpadding="0" class="table"><tr>';
                        htmlNorthBuilding += '<td width="70%" align="left" valign="top">';
                        htmlNorthBuilding += '<table class="table" width="100%" border="1" cellspacing="0" cellpadding="0" style="font-size:13px;">';
                        htmlNorthBuilding += '<tr style="background-color:#6dcff6;">';
                        htmlNorthBuilding += '<td colspan="4"><strong style="color:#9e0b0f;">GIS ID :' + summarydata.gis_id + '</strong></td></tr>';
                        htmlNorthBuilding += '<tr><td width="28%">Owner Surname<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td width="25%"><strong>' + summarydata.surname_owner + '</strong></td><td width="27%">House No/Plot No<br/>(à°‡à°‚à°Ÿà°¿ à°¨à±†à°‚.)</td><td width="20%">' + summarydata.door_no + '</td></tr>';
                        htmlNorthBuilding += '<tr><td height="25">Owner Name<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°ªà±‡à°°à±)</td><td><strong>' + summarydata.name_owner + '</strong></td><td>Property Tax No<br/>(à°ªà°¨à±à°¨à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.property_tax_no + '</td></tr>';
                        htmlNorthBuilding += '<tr><td>Father Surname<br/>(à°¤à°‚à°¡à±à°°à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td>' + summarydata.fsurname_owner + '</td><td>Street<br/>(à°µà±€à°§à°¿)</td><td>' + summarydata.street + '</td></tr>';
                        htmlNorthBuilding += '<tr><td>Father Name<br/>(à°¤à°‚à°¡à±à°°à°¿ à°ªà±‡à°°à±)</td><td>' + summarydata.fname_owner + '</td><td>Election Ward No<br/>(à°µà°¾à°°à±à°¡à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.elec_ward_no + '</td></tr>';
                        htmlNorthBuilding += '<tr><td>Mobile Number<br/>(à°®à±Šà°¬à±†à±–à°²à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.mobile_owner + '</td><td>Number of Floors<br/>(à°…à°‚à°¤à°¸à±à°¤à±à°²à±)</td><td>' + summarydata.no_floors + '</td></tr>';
                        htmlNorthBuilding += '<tr><td>Aadhaar Number<br/>(à°†à°§à°¾à°°à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.aadhar_owner + '</td><td>Category<br/>(à°°à°•à°®à±)</td><td>' + summarydata.type_category + '</td></tr>';
                        htmlNorthBuilding += '<tr><td>Gender<br/>(à°²à°¿à°‚à°—à°‚)</td><td>' + summarydata.gender + '</td><td>Is tap available<br/>(à°¨à°²à±à°²à°¾ à°•à°¨à±†à°•à±à°·à°¨à± à°•à°²à°¿à°—à°¿ à°‰à°¨à±à°¨à°¾à°°à°¾?)</td><td>' + summarydata.istap_available + '</td></tr>';
                        htmlNorthBuilding += '<td width="10%" align="center" valign="middle"><img src="' + summarydata.survey_pic + '"alt="Mountain View" style="width:200px;height:150px;" /></td></tr></table>';

                        var wkt = summarydata.geom;
                        var format = new ol.format.WKT();
                        var feature = format.readFeature(wkt, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });
                        feature.setStyle(nei_style);
                        sourceGeomBuilding.addFeature(feature);

                        $("#tab1primary").empty();
                        $("#tab1primary").append(htmlNorthBuilding);
                    } else {
                        htmlNorthBuilding += '<div style="height:450px; overflow:scroll;">No data</div> ';
                        htmlNorthBuilding += '</table></div>';
                        $("#tab1primary").empty();
                        $("#tab1primary").append(htmlNorthBuilding);

                    }

                    if ($.trim(response.message.east_building)) {

                        var summarydata = response.message.east_building;
                        htmlEastBuilding += '<table width="100%" border="1" cellspacing="0" cellpadding="0" class="table"><tr>';
                        htmlEastBuilding += '<td width="70%" align="left" valign="top">';
                        htmlEastBuilding += '<table class="table" width="100%" border="1" cellspacing="0" cellpadding="0" style="font-size:13px;">';
                        htmlEastBuilding += '<tr style="background-color:#6dcff6;">';
                        htmlEastBuilding += '<td colspan="4"><strong style="color:#9e0b0f;">GIS ID :' + summarydata.gis_id + '</strong></td></tr>';
                        htmlEastBuilding += '<tr><td width="28%">Owner Surname<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td width="25%"><strong>' + summarydata.surname_owner + '</strong></td><td width="27%">House No/Plot No<br/>(à°‡à°‚à°Ÿà°¿ à°¨à±†à°‚.)</td><td width="20%">' + summarydata.door_no + '</td></tr>';
                        htmlEastBuilding += '<tr><td height="25">Owner Name<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°ªà±‡à°°à±)</td><td><strong>' + summarydata.name_owner + '</strong></td><td>Property Tax No<br/>(à°ªà°¨à±à°¨à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.property_tax_no + '</td></tr>';
                        htmlEastBuilding += '<tr><td>Father Surname<br/>(à°¤à°‚à°¡à±à°°à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td>' + summarydata.fsurname_owner + '</td><td>Street<br/>(à°µà±€à°§à°¿)</td><td>' + summarydata.street + '</td></tr>';
                        htmlEastBuilding += '<tr><td>Father Name<br/>(à°¤à°‚à°¡à±à°°à°¿ à°ªà±‡à°°à±)</td><td>' + summarydata.fname_owner + '</td><td>Election Ward No<br/>(à°µà°¾à°°à±à°¡à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.elec_ward_no + '</td></tr>';
                        htmlEastBuilding += '<tr><td>Mobile Number<br/>(à°®à±Šà°¬à±†à±–à°²à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.mobile_owner + '</td><td>Number of Floors<br/>(à°…à°‚à°¤à°¸à±à°¤à±à°²à±)</td><td>' + summarydata.no_floors + '</td></tr>';
                        htmlEastBuilding += '<tr><td>Aadhaar Number<br/>(à°†à°§à°¾à°°à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.aadhar_owner + '</td><td>Category<br/>(à°°à°•à°®à±)</td><td>' + summarydata.type_category + '</td></tr>';
                        htmlEastBuilding += '<tr><td>Gender<br/>(à°²à°¿à°‚à°—à°‚)</td><td>' + summarydata.gender + '</td><td>Is tap available<br/>(à°¨à°²à±à°²à°¾ à°•à°¨à±†à°•à±à°·à°¨à± à°•à°²à°¿à°—à°¿ à°‰à°¨à±à°¨à°¾à°°à°¾?)</td><td>' + summarydata.istap_available + '</td></tr>';
                        htmlEastBuilding += '<td width="10%" align="center" valign="middle"><img src="' + summarydata.survey_pic + '"alt="Mountain View" style="width:200px;height:150px;" /></td></tr></table>';

                        var wkt = summarydata.geom;
                        var format = new ol.format.WKT();
                        var feature = format.readFeature(wkt, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });
                        feature.setStyle(nei_style);
                        sourceGeomBuilding.addFeature(feature);

                        $("#tab2primary").empty();
                        $("#tab2primary").append(htmlEastBuilding);
                    } else
                    {
                        htmlEastBuilding += '<div style="height:450px; overflow:scroll;">No data</div> ';
                        htmlEastBuilding += '</table></div>';
                        $("#tab2primary").empty();
                        $("#tab2primary").append(htmlEastBuilding);

                    }


                    if ($.trim(response.message.south_building)) {

                        var summarydata = response.message.south_building;
                        htmlSouthBuilding += '<table width="100%" border="1" cellspacing="0" cellpadding="0" class="table"><tr>';
                        htmlSouthBuilding += '<td width="70%" align="left" valign="top">';
                        htmlSouthBuilding += '<table class="table" width="100%" border="1" cellspacing="0" cellpadding="0" style="font-size:13px;">';
                        htmlSouthBuilding += '<tr style="background-color:#6dcff6;">';
                        htmlSouthBuilding += '<td colspan="4"><strong style="color:#9e0b0f;">GIS ID :' + summarydata.gis_id + '</strong></td></tr>';
                        htmlSouthBuilding += '<tr><td width="28%">Owner Surname<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td width="25%"><strong>' + summarydata.surname_owner + '</strong></td><td width="27%">House No/Plot No<br/>(à°‡à°‚à°Ÿà°¿ à°¨à±†à°‚.)</td><td width="20%">' + summarydata.door_no + '</td></tr>';
                        htmlSouthBuilding += '<tr><td height="25">Owner Name<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°ªà±‡à°°à±)</td><td><strong>' + summarydata.name_owner + '</strong></td><td>Property Tax No<br/>(à°ªà°¨à±à°¨à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.property_tax_no + '</td></tr>';
                        htmlSouthBuilding += '<tr><td>Father Surname<br/>(à°¤à°‚à°¡à±à°°à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td>' + summarydata.fsurname_owner + '</td><td>Street<br/>(à°µà±€à°§à°¿)</td><td>' + summarydata.street + '</td></tr>';
                        htmlSouthBuilding += '<tr><td>Father Name<br/>(à°¤à°‚à°¡à±à°°à°¿ à°ªà±‡à°°à±)</td><td>' + summarydata.fname_owner + '</td><td>Election Ward No<br/>(à°µà°¾à°°à±à°¡à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.elec_ward_no + '</td></tr>';
                        htmlSouthBuilding += '<tr><td>Mobile Number<br/>(à°®à±Šà°¬à±†à±–à°²à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.mobile_owner + '</td><td>Number of Floors<br/>(à°…à°‚à°¤à°¸à±à°¤à±à°²à±)</td><td>' + summarydata.no_floors + '</td></tr>';
                        htmlSouthBuilding += '<tr><td>Aadhaar Number<br/>(à°†à°§à°¾à°°à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.aadhar_owner + '</td><td>Category<br/>(à°°à°•à°®à±)</td><td>' + summarydata.type_category + '</td></tr>';
                        htmlSouthBuilding += '<tr><td>Gender<br/>(à°²à°¿à°‚à°—à°‚)</td><td>' + summarydata.gender + '</td><td>Is tap available<br/>(à°¨à°²à±à°²à°¾ à°•à°¨à±†à°•à±à°·à°¨à± à°•à°²à°¿à°—à°¿ à°‰à°¨à±à°¨à°¾à°°à°¾?)</td><td>' + summarydata.istap_available + '</td></tr>';
                        htmlSouthBuilding += '<td width="10%" align="center" valign="middle"><img src="' + summarydata.survey_pic + '"alt="Mountain View" style="width:200px;height:150px;" /></td></tr></table>';

                        var wkt = summarydata.geom;
                        var format = new ol.format.WKT();
                        var feature = format.readFeature(wkt, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });
                        feature.setStyle(nei_style);
                        sourceGeomBuilding.addFeature(feature);
                        $("#tab3primary").empty();
                        $("#tab3primary").append(htmlSouthBuilding);
                    } else
                    {
                        htmlSouthBuilding += '<div style="height:450px; overflow:scroll;">No data</div> ';
                        htmlSouthBuilding += '</table></div>';
                        $("#tab3primary").empty();
                        $("#tab3primary").append(htmlSouthBuilding);
                    }
                    if ($.trim(response.message.west_building)) {

                        var summarydata = response.message.west_building;
                        htmlWestBuilding += '<table width="100%" border="1" cellspacing="0" cellpadding="0" class="table"><tr>';
                        htmlWestBuilding += '<td width="70%" align="left" valign="top">';
                        htmlWestBuilding += '<table class="table" width="100%" border="1" cellspacing="0" cellpadding="0" style="font-size:13px;">';
                        htmlWestBuilding += '<tr style="background-color:#6dcff6;">';
                        htmlWestBuilding += '<td colspan="4"><strong style="color:#9e0b0f;">GIS ID :' + summarydata.gis_id + '</strong></td></tr>';
                        htmlWestBuilding += '<tr><td width="28%">Owner Surname<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td width="25%"><strong>' + summarydata.surname_owner + '</strong></td><td width="27%">House No/Plot No<br/>(à°‡à°‚à°Ÿà°¿ à°¨à±†à°‚.)</td><td width="20%">' + summarydata.door_no + '</td></tr>';
                        htmlWestBuilding += '<tr><td height="25">Owner Name<br/>(à°¯à°œà°®à°¾à°¨à°¿ à°ªà±‡à°°à±)</td><td><strong>' + summarydata.name_owner + '</strong></td><td>Property Tax No<br/>(à°ªà°¨à±à°¨à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.property_tax_no + '</td></tr>';
                        htmlWestBuilding += '<tr><td>Father Surname<br/>(à°¤à°‚à°¡à±à°°à°¿ à°‡à°‚à°Ÿà°¿à°ªà±‡à°°à±)</td><td>' + summarydata.fsurname_owner + '</td><td>Street<br/>(à°µà±€à°§à°¿)</td><td>' + summarydata.street + '</td></tr>';
                        htmlWestBuilding += '<tr><td>Father Name<br/>(à°¤à°‚à°¡à±à°°à°¿ à°ªà±‡à°°à±)</td><td>' + summarydata.fname_owner + '</td><td>Election Ward No<br/>(à°µà°¾à°°à±à°¡à± à°¸à°‚à°–à±à°¯)</td><td>' + summarydata.elec_ward_no + '</td></tr>';
                        htmlWestBuilding += '<tr><td>Mobile Number<br/>(à°®à±Šà°¬à±†à±–à°²à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.mobile_owner + '</td><td>Number of Floors<br/>(à°…à°‚à°¤à°¸à±à°¤à±à°²à±)</td><td>' + summarydata.no_floors + '</td></tr>';
                        htmlWestBuilding += '<tr><td>Aadhaar Number<br/>(à°†à°§à°¾à°°à± à°¨à±†à°‚à°¬à°°à±)</td><td>' + summarydata.aadhar_owner + '</td><td>Category<br/>(à°°à°•à°®à±)</td><td>' + summarydata.type_category + '</td></tr>';
                        htmlWestBuilding += '<tr><td>Gender<br/>(à°²à°¿à°‚à°—à°‚)</td><td>' + summarydata.gender + '</td><td>Is tap available<br/>(à°¨à°²à±à°²à°¾ à°•à°¨à±†à°•à±à°·à°¨à± à°•à°²à°¿à°—à°¿ à°‰à°¨à±à°¨à°¾à°°à°¾?)</td><td>' + summarydata.istap_available + '</td></tr>';
                        htmlWestBuilding += '<td width="10%" align="center" valign="middle"><img src="' + summarydata.survey_pic + '"alt="Mountain View" style="width:200px;height:150px;" /></td></tr></table>';
                        var wkt = summarydata.geom;
                        var format = new ol.format.WKT();
                        var feature = format.readFeature(wkt, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: 'EPSG:3857'
                        });

                        feature.setStyle(nei_style);
                        sourceGeomBuilding.addFeature(feature);
                        $("#tab4primary").empty();
                        $("#tab4primary").append(htmlWestBuilding);
                    } else
                    {
                        htmlWestBuilding += '<div style="height:450px; overflow:scroll;">No data</div> ';
                        htmlWestBuilding += '</table></div>';
                        $("#tab4primary").empty();
                        $("#tab4primary").append(htmlWestBuilding);
                    }


                }

            }, function () {
                var n = noty({
                    text: 'Error warning!',
                    type: 'error',
                    animation: {
                        open: {height: 'toggle'},
                        close: {height: 'toggle'},
                        easing: 'swing',
                        speed: 2000 // opening & closing animation speed
                    }
                });
                n.close();
            })


//            $.ajax({
//                type: 'GET',
//                url: urlDestination,
//                data: "gis_id=" + gis_id,
//                success: ,
//                error: 
//            });

        });

        $("#tabs-tax").click(function () {
            var htmltax = "";
            if ($("#tabs-5").html().length > 0)
                //alert(html().length);
                return;

            $("#tabs-5").append('<div style="height:450px; overflow:scroll;">Please wait....</div> ')
            var urlDestination = "php/gettaxdetails.php";
            if (assnn_no != '')
            {
                if (!isNaN(assnn_no))
                {

                    $u.ajaxRequest('GET', urlDestination, "assessmentNo=" + assnn_no, function (response) {
                        var asg = response;
                        $("#tabs-5").empty();
                        $("#tabs-5").append(asg);
                    }, function () {
                        var n = noty({
                            text: 'Error warning!',
                            type: 'error',
                            animation: {
                                open: {height: 'toggle'},
                                close: {height: 'toggle'},
                                easing: 'swing',
                                speed: 2000 // opening & closing animation speed
                            }
                        });
                        n.close();
                    });

//                    $.ajax({
//                        type: 'GET',
//                        url: urlDestination,
//                        data: "assessmentNo=" + assnn_no,
//                        success: function (response) {
//
//
//
//
//
//                        },
//                        error: 
//                    });
                } else
                {
                    var msg = 'Invailid Assessment number';
                    $("#tabs-5").empty();
                    $("#tabs-5").append(msg);
                }
            } else
            {
                var msg = 'Assessment number not found';
                $("#tabs-5").empty();
                $("#tabs-5").append(msg);
            }

        });

        $(".form-control").change(function () {
            $("#searchInput").attr("placeholder", "Search for " + $(".form-control option:selected").text());
        });
        
        // $(document).ready(function(){
        //     var formData = $('#searchFilter').serializeArray();
        //     searchFeature(formData);
        // });
        
        
         var defaultSurveyStyle = survey[0].getStyle();
         var defaultNonSurveyStyle = survey[1].getStyle();
        
        $("#btnSearch").click(function () {  
            var view = map.getView();
            var viewCenter = view.getCenter();
            var formData = $('#searchFilter').serializeArray();
                searchFeature(formData, viewCenter);
            //     var newZoom = global.appConfig.defaultZoom;
            //     view.animate({
            //         zoom: newZoom,
            //         center:global.appConfig.defaultCenter
            //     });
            
        // //   setTimeout(function()
        // //   {
        // //       var formData = $('#searchFilter').serializeArray();
        // //       searchFeature(formData);
        // //   },1000);
            
        //     // zoomToNonSurveyPolygon(map);
        

        
        // survey[1].setVisible(false)
        // survey[0].setVisible(false)
        
        // //filter survey
        // var selectSurvey = document.getElementById('surveyed_id')
        // var SurveyValue = selectSurvey.value
        
        // //filter sale rent
        // var SaleRent = document.getElementById('sale_rent')
        // var SaleRentValue = SaleRent.value
        // var SaleSelected= SaleRentValue==1?1:0
        // var RentSelected= SaleRentValue==2?1:0 
    
        
        
        // //filter pincode
        // var pincode = document.getElementById('pincode')
        // var pincodeValue = pincode.value.toString()

        // //filter Unit_type
        // var unitType = document.getElementById('unit_type')
        
        // var unitTypeValue = unitType.value
        // //category Id
        // var catId = document.getElementById('category_property')
        // var catIdValue = catId.value
        // //Filter GISID
        // //Style filter
        // const baseStyleSurveyPolygon = new ol.style.Style({
        //                                 fill: new ol.style.Fill({
        //                                     color: 'rgba(0, 255, 0, 0.1)'
        //                                 }),
        //                                 stroke: new ol.style.Stroke({
        //                                     color:'rgb(0, 255, 0)'
        //                                 })
        //                                 });
        // const baseStyleNonSurveyPolygon = new ol.style.Style({
        //                                 fill: new ol.style.Fill({
        //                                     color: 'rgba(255, 0, 0, 0.1)'
        //                                 }),
        //                                 stroke: new ol.style.Stroke({
        //                                     color:'rgb(255, 0, 0)'
        //                                 })
        //                                 });
          
        // if(SurveyValue == 1 || SurveyValue == ""){
        //     var formData = $('#searchFilter').serializeArray();
        //         searchFeature(formData, viewCenter);
        //     var filterStyle = (feature) => {
        //         var properties = feature.getProperties();
        //         // console.log("unit_type_id "+properties['unit_type_id'])
        //         // console.log("cat_id "+properties['cat_id'])
        //         // console.log("pincode "+properties['pincode'])
        //         let SurveyCondition = true; 
        //         let SaleCondition = true; 
        //         let RentCondition = true; 

        //         // Check if each property exists and meets the condition. If it does not exist, this part is skipped.
        //         if (unitTypeValue !== undefined && unitTypeValue !=="") {
        //           SurveyCondition = SurveyCondition && (properties['unit_type_id'] === parseInt(unitTypeValue));
        //         }
        //         if (catIdValue !== undefined && catIdValue !=="" ) {
        //           SurveyCondition = SurveyCondition && (properties['cat_id'] === parseInt(catIdValue));
        //         }
        //         if (pincodeValue !== undefined && pincodeValue !=="") {
        //           SurveyCondition = SurveyCondition && (properties['pincode'] === pincodeValue);
        //         }
        //         if (SaleSelected !== undefined && SaleSelected !=="") {
        //           SaleCondition = SurveyCondition && (properties['forsale'] === SaleSelected);
        //         }
        //         if (RentSelected !== undefined && RentSelected !=="") {
        //           RentCondition = SurveyCondition && (properties['forrent'] === RentSelected);
        //         }
                
        //         if (SaleCondition) {
        //           return baseStyleSurveyPolygon
        //         }
        //         if (RentCondition) {
        //           return baseStyleSurveyPolygon
        //         }
                

        //     }
        //     survey[1].setVisible(true)
        //     survey[1].setStyle(filterStyle);
            
        // }
        // if(SurveyValue == 2 || SurveyValue == "") {
        //     var filterStyle =(feature)=>{
        //         var properties = feature.getProperties();
        //         let NoSurveyCondition = true; 
                
                
        //         if (unitTypeValue !== undefined && unitTypeValue !=="") {
        //           NoSurveyCondition = NoSurveyCondition && (properties['unit_type_id'] === parseInt(unitTypeValue));
        //         }
        //         if (catIdValue !== undefined && catIdValue !=="" ) {
        //           NoSurveyCondition = NoSurveyCondition && (properties['cat_id'] === parseInt(catIdValue));
        //         }
        //         if (pincodeValue !== undefined && pincodeValue !=="") {
        //           NoSurveyCondition = NoSurveyCondition && (properties['pincode'] === pincodeValue);
        //         }
        //         if(NoSurveyCondition){
        //             return baseStyleNonSurveyPolygon;           
        //         }      
        //     }   
        //     survey[0].setVisible(true)
        //     survey[0].setStyle(filterStyle)
            
        //     var buildingLayer = map.getLayers().getArray().find(layer => layer.get('name') === "Survey Point");
        //     map.removeLayer(buildingLayer)
            
        // }
    });


        $('#btnReset').click(function(){
            $('#searchFilter')[0].reset();
            $('.filter-data').hide();
            var formData = $('#searchFilter').serializeArray();
            searchFeature(formData, global.appConfig.defaultCenter);
            mapView.setCenter(global.appConfig.defaultCenter);
            // global.placeCard.hideCard();
            // global.popupController.hidePopup();
            GISApp.layerController.removeLayer('Point-Searched', map);
            GISApp.layerController.removeLayer('Point-Clicked', map);
            // $('#searchFilter')[0].reset();
            // $('.filter-data').hide();
            // var formData = $('#searchFilter').serializeArray();
            // // if (isLiveLocation === false) {
            // //     mapView.setCenter(global.appConfig.defaultCenter);
            // //     mapView.setZoom(global.appConfig.defaultZoom);
            // // }
            // mapView.setCenter(global.appConfig.defaultCenter);
            // // mapView.setZoom(global.appConfig.minZoom);
            
            // searchFeature(formData,global.appConfig.defaultCenter);
        })
        
        $('#searchInput').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {
                searchFeature();
            }
        });
    });
    
    function FilterGisId(GisId, GisIdNonSurvey){
        const baseStyleSurveyPolygon = new ol.style.Style({
                                        fill: new ol.style.Fill({
                                            color: 'rgba(0, 255, 0, 0.1)'
                                        }),
                                        stroke: new ol.style.Stroke({
                                            color:'rgb(0, 255, 0)'
                                        })
                                        });
        const baseStyleNonSurveyPolygon = new ol.style.Style({
                                        fill: new ol.style.Fill({
                                            color: 'rgba(255, 0, 0, 0.1)'
                                        }),
                                        stroke: new ol.style.Stroke({
                                            color:'rgb(255, 0, 0)'
                                        })
                                        });                                
        var filterStyle = (feature) => {
            var properties = feature.getProperties();
            // GisId.forEach(data=>{
                    // properties['gis_id'] === data
                  
            // })
            if(GisId.includes(properties['gis_id'])){
                return baseStyleSurveyPolygon;
            }
            if(GisIdNonSurvey.includes(properties['gis_id'])){
                if(GisIdNonSurvey.length === 1){
                    zoomToNonSurveyPolygon(map,feature,GisIdNonSurvey.join(','));
                }   
                return baseStyleNonSurveyPolygon;
            }
        }
        survey[1].setVisible(true)
        survey[1].setStyle(filterStyle);
        survey[0].setStyle(filterStyle);
        
    }
    
    function searchFeature(formData, coordinates = null) {     
            //  Get the current extent of the map
            var extent = map.getView().calculateExtent(map.getSize());
            var minX = extent[0];
            var minY = extent[1];
            var maxX = extent[2];
            var maxY = extent[3];
            
            var urlDestination = apiUrl+"/surveyor/webgis/get-search-feature";
            sourceGeomBuilding.clear();

            var postData = formData;
            
            postData.push({name: 'minX', value: minX})
            postData.push({name: 'minY', value: minY})
            postData.push({name: 'maxX', value: maxX})
            postData.push({name: 'maxY', value: maxY})
            postData.push({name: 'latLive', value: coordinates !== null ? coordinates[0] : null})
            postData.push({name: 'lngLive', value: coordinates !== null ? coordinates[1] : null})
            
            $u.ajaxRequest('POST', urlDestination,
                postData, async function (response) {
                    var propertiesCount = response.message.filter((res) => 
                        res.surveyed === "surveyed"
                    ).length;
                    
                    if (response.message.length == '21500') {
                            $("#properties_count").text(propertiesCount); 
                        } else {
                            $("#properties_count").text(propertiesCount);
                        }
                    
                    if (Array.isArray(response.message)) {
                        
                        $("#properties_count").text(propertiesCount);
                        $("#countdiv").show();
                        var ids_survey = [];
                        var ids_not_survey = [];
                        var surveylayer = [];
                        
                        for (i = 0; i < response.message.length; i++) {
                            let item = response.message[i];
                            let id = item.gis_id;
                            let survey_status = item.surveyed;
                            
                            if (survey_status === "surveyed") {
                                ids_survey.push(id)
                                surveylayer.push(item)
                             } 
                            else if (survey_status === "not-surveyed") {
                                ids_not_survey.push(id)
                            }
                                
                                
                            // ids.push(id);
                        } 
                        FilterGisId(ids_survey, ids_not_survey)
                        // Handle Building Styles
                        var survey_line_style = '#00ff00'
                        var survey_polygon_point = 'Survey Point'
                        var survey_polygon_name = 'Survey Polygon'
                        var survey_fill_style ='rgba(0, 255, 0, 0.1)'
                        var survey_url = apiUrl+"/surveyor/webgis/update-building-layer";
                        
                        // var non_survey_line_style = '#ff0000'
                        // var non_survey_polygon_name = 'Not Survey Polygon'
                        // var non_survey_fill_style = 'rgba(255, 0, 0, 0.1)'
                        // var non_survey_url = apiUrl+"/surveyor/webgis/update-non-survey-layer";
                        
                        GISApp.layerController.clearSurveyAndNonSurveyLayer(map);
                        GISApp.layerController.handleHighlightLayer(surveylayer, map, survey_fill_style, survey_line_style, survey_polygon_name, survey_polygon_point);
                        //await updateHighlightLayer(survey_url, ids_survey, postData, survey_fill_style, survey_line_style, survey_polygon_name, survey_polygon_point);
                    
                        //await updateHighlightLayer(non_survey_url, ids_not_survey, postData, non_survey_fill_style, non_survey_line_style, non_survey_polygon_name, null);
                        
                        if (coordinates === null) {
                            setTimeout(() =>  {
                                zoomToBuildingLayer(map); 
                            }, 2000) 
                        }
                    } else {
                        var n = noty({
                                text: 'No result!',
                                type: 'notification',
                                layout: 'center',
                                animation: {
                                    open: {height: 'toggle'},
                                    close: {height: 'toggle'},
                                    easing: 'swing',
                                    speed: 2000 // opening & closing animation speed
                                }
                            });
                        n.close();
                    }
                }, function () {
                    var n = noty({
                    text: 'Error warning!',
                    type: 'error',
                    layout: 'center',
                    animation: {
                        open: {height: 'toggle'},
                        close: {height: 'toggle'},
                        easing: 'swing',
                        speed: 1000 // opening & closing animation speed
                    }
                });
                    n.close();
                }
            )
//            $.ajax({
//                type: 'GET',
//                url: urlDestination,
//                data: "search='" + searchText + "'&code='" + filter + "'",
//                success: ,
//                error: 
//            });
            
        }
        
    function updateHighlightLayer(url, ids, postData, styleFill, styleLine, polygonLayerName, buildingLayerName) {
        if (ids.length === 0) return;
        
        var csrfToken = $('#csrf-token').attr('content');
        $u.ajaxRequest('POST', url,
            {
                "_token":csrfToken,
                "filterData":postData,
                "ids": ids.join(","), 
                "_timestamp": (new Date()).getTime()
            }, function (responseInner) {
                if (responseInner.status && responseInner.status == true) {
                    try {
                        let dataList = responseInner.message;
                        if (dataList.length > 0) {
                            GISApp.layerController.handleHighlightLayer(dataList, map, styleFill, styleLine, polygonLayerName, buildingLayerName);
                            zoomToNonSurveyPolygon(map,ids);
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }
            })
    }
    function zoomToBuildingLayer(map) {
        var buildingLayer = map.getLayers().getArray().find(layer => layer.get('name') === "Survey Point");
        console.log(map.getLayers().getArray());
        if (buildingLayer) {
            var buildingSource = buildingLayer.getSource();
            var buildingFeature = buildingSource.getFeatures();
            buildingLayer.setZIndex(7)
            if (buildingFeature.length === 1) return;
            
            var extent = buildingSource.getExtent();

            map.getView().fit(extent, { padding: [10, 10, 10, 10] });
        }
    }
    //Add scaleLine, Overviewmap
    map.addControl(new ol.control.OverviewMap())
    map.addControl(new ol.control.ScaleLine());
    //Handle search non-survey-polygon
    function zoomToNonSurveyPolygon(map,feature,id){
        // var properties = feature.getProperties();
        // var geometry = properties.getGeometry();
        var extent = feature.getExtent();
        map.getView().fit(extent, {size: map.getSize(), maxZoom:24});
        var center = ol.extent.getCenter(extent);
        global.popupController.showPopup(center,id);
              
           }
    //Cluster event
    map.on('click', function(evt) {
        // var cluster = map.getLayers().getArray();
        // var clusterfind = cluster.find(layer=>layer.get('name') === "Survey Point");
      var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
          console.log(feature)
        return feature;
      });
      if (feature) {
        var features = feature.get('features');
        if (features != undefined && features.length > 1) {
          var extent = ol.extent.createEmpty();
          features.forEach(function(feature) {
            ol.extent.extend(extent, feature.getGeometry().getExtent());
          });
          map.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50]});
        }
      }
    });
    
    
    // Live Location
    var isLiveLocation = false;
    window.addEventListener('DOMContentLoaded', (event) => {
        setTimeout(function() {
        const button = document.getElementById('btnCrosshair');
        button.click();
        }, 100)
    });
    $("#btnCrosshair").click(function () {
        GISApp.googleSearchController.setMap(map);
        var formData = $('#searchFilter').serializeArray();
        var currentSrc = $("#crosshair-image").attr("src");
        if (currentSrc.endsWith("geo-location.svg")) {
            $("#crosshair-image").attr("src", apiUrl+"/public/webgis/images/geo-location-clicked.svg");
            startAutoLocate(formData);
            isLiveLocation = true;
        } else {
            $("#crosshair-image").attr("src", apiUrl+"/public/webgis/images/geo-location.svg");
            stopAutoLocate();
            mapView.setCenter(global.appConfig.defaultCenter);
            mapView.setZoom(global.appConfig.defaultZoom);
            
            isLiveLocation = false;
        }
    });
    
})(window.GISApp, jQuery)
;
