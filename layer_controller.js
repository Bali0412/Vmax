(function (global, $) {

    var MAP_BASE_URL = global.appConfig.geoserverURL;
    var GWC_URL = MAP_BASE_URL + global.appConfig.urlGWC;
    var WMS_URL = MAP_BASE_URL + global.appConfig.urlWMS;

    let layers = {};

    var mapVectorLayers = [];//bỏ
    var mapBackgroundLayers = [];//bỏ
    var mapNeopolishLayers = [];//bỏ

    function createlayer(mapURL, layerObj) {//hàm tạo layer từ layer data truyền vào
        tile = !!layerObj.tile;//lấy giá trị tile trong layerObj được truyền vào (boolean)
        var layer = null;
        var source = null;
        var styles = layerObj.styles || undefined;//nếu style tồn tại thì lấy ngược lại undefine
        var metroFeatures = []//bỏ

        var params = { //tạo một biến param để sử dụng cho WMS
            LAYERS: layerObj.layers,//lấy tên layer để gán vào LAYERS
            SRS: layerObj.srs || global.appConfig.mapProjection, //lấy projection mặc định 
            VERSION: layerObj.serviceVersion,//lấy version của geoserver
            STYLES: styles
        }
        
		if(layerObj.vector) {//nếu vector tồn tại
			mapURL = MAP_BASE_URL + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + layerObj.geserver_id + "&outputFormat=application%2Fjson"; //lấy dữ liệu từ geoserver
			
			layer = new ol.layer.Vector({//tạo một vector mới
			    title: layerObj.title,
			    visible: !!layerObj.visible,
			    source: new ol.source.Vector({				 
			        url: mapURL,
				    format: new ol.format.GeoJSON()
			    }),
			    style: function(feature) {
			        if (layerObj.type === 'Point') {
			            return new ol.style.Style({
    			            image: new ol.style.Circle({
                                radius: 6,
                                fill: new ol.style.Fill({
                                    color: layerObj.fillColor,
                                }),
                                stroke: new ol.style.Stroke({
                                    color: layerObj.fillStroke,
                                    width: 2,
                                }),
                            })
			            })
			        } else if (layerObj.type === 'LineString') {
			            let map = global.mapController.map
			            let zoom = map.getView().getZoom();
			            let width = zoom < 9 ? 4.5
			                        : zoom < 10 ? 4
			                        : zoom < 11 ? 3.5
			                        : zoom < 12 ? 3
			                        : 2.5
			            
			            let name = feature.get('name')
			            let style = layerObj.styleFeature[name]
			            return new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: style,
                                width: width,
                            })
                        });
			        } else if (layerObj.type === 'Polygon') {
			            return new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: layerObj.fillStroke,
                                width: layerObj.fillWidth,
                            })
                        });
			        }
			        
			    },
			    name: layerObj.name
			});
			layer.getSource().on('addfeature', function (event) {
                var feature = event.feature;
                feature.set('title', layerObj.title);
            });
		} else {
		    var layerNames = ["Neopolish", "Neopolish 2"]
		    var layerName = layerObj.name
		  //  if (layerNames.includes(layerName)) return;
            // Handle Source
            if (layerObj.GWCservice === 'WMTS') {//nếu GWCservice là WMTS
                
                source = new ol.source.XYZ({//tạo source XYZ
                    url: mapURL + global.appConfig.WMTSService +
                        `layer=${layerObj.geserver_id}` + 
                        `&style=` + 
                        `&tilematrixset=EPSG%3A900913` + 
                        `&Service=WMTS` + 
                        `&Request=GetTile` + 
                        `&Version=1.0.0&` +
                        `Format=image%2Fpng` + 
                        `&TileMatrix=EPSG%3A900913%3A{z}&TileCol={x}&TileRow={y}` + 
                        `&exceptions=application%2Fvnd.ogc.se_xmls`,
                    crossOrigin: 'anonymous'
                })
            }
            else {//nếu không là WMTS
                source = new ol.source.TileWMS({//thêm các param vào tileWMS
                    url: mapURL + global.appConfig.WMSService,
                    params: params,
                    serverType: layerObj.serverType || 'geoserver'
                })
            }
            // Handle Layer Tile
			if (tile) {//nếu tile là true

            layer = new ol.layer.Tile({//tạo một Tile 
                title: layerObj.title,
                visible: !!layerObj.visible,
                source: source
            });

			} else {//Ngược lại

				layer = new ol.layer.Image({//Tạo một imag
					title: layerObj.title,
					visible: !!layerObj.visible,
					source: new ol.source.ImageWMS({
						url: mapURL,
						params: params,
						serverType: layerObj.serverType || 'geoserver'
					})
				})
			}
		}

        return layers[layerObj.id] = layer;//trả về các layer trong các key id layer
    }


    function initBackgroundLayers() { //hàm tạo các lớp nền

        // var roadmapLayer = new olgm.layer.Google({
        //     title: "Google street map",
        //     mapTypeId: google.maps.MapTypeId.ROADMAP
        // });

        // var hybridlayer = new olgm.layer.Google({
        //     title: "Google earth map",
        //     mapTypeId: google.maps.MapTypeId.HYBRID,
        //     visible: false
        // });

        var baseLayers = new ol.layer.Group( //tạo một group chứa các base
                {title: 'Base Layers', //đặt title " Base Layers"
                    openInLayerSwitcher: false,// bất cập
                    visible: true,// set hiển thị
                    layers://thêm các layer là các lớp nền vào
                            [
                                new ol.layer.Tile(
                                        {title: "Watercolor",
                                            baseLayer: true,
                                            visible: false,
                                            source: new ol.source.Stamen({
                                                layer: 'watercolor'
                                            })
                                        }),
                                new ol.layer.Tile(
                                        {title: "Toner",
                                            baseLayer: true,
                                            visible: false,
                                            source: new ol.source.Stamen({
                                                layer: 'toner'
                                            })
                                        }),
                                new ol.layer.Tile(
                                        {title: "OSM",
                                            baseLayer: true,
                                            source: new ol.source.OSM(),
                                            visible: false
                                        }),
                                new ol.layer.Tile(
                                        {
                                            title: "Bing map",
                                            baseLayer: true,
                                            visible: false,
                                            source: new ol.source.BingMaps({
                                                key: 'As1HiMj1PvLPlqc_gtM7AqZfBL8ZL3VrjaS3zIb22Uvb9WKhuJObROC-qUpa81U5',
                                                imagerySet: 'AerialWithLabels'

                                            })

                                        }),
                                new ol.layer.Tile(
                                    {
                                        title: "Google street map",
                                        baseLayer: true,
                                        visible: false,
                                        source: new ol.source.XYZ({
                                            url: 'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}'
                                        })
                                    }
                                ),
                                new ol.layer.Tile(
                                    {
                                        title: "Google earth map",
                                        baseLayer: true,
                                        visible: true,
                                        source: new ol.source.XYZ({
                                            url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                                        })
                                    }
                                ),
                                new ol.layer.Tile(
                                    {
                                        title:"Satellite Images",
                                        baseLayer: true,
                                        visible: false,
                                        source: new ol.source.TileWMS({
                                            url: MAP_BASE_URL+'/wms?service=WMS&version=1.1.0&request=GetMap&layers=gis%3Asatellite_image&bbox=8712840.4855%2C1974244.1458%2C8722704.3731%2C1984750.7137&width=721&height=768&srs=EPSG%3A3857&styles=&format=application/openlayers',
                                            params:{
                                                'LAYERS':'gis:satellite_image',
                                            },
                                        serverType:'geoserver'
                                        })
                                    })

                            ]
                });

        // return mapBackgroundLayers = [roadmapLayer, hybridlayer, baseLayers];
        return mapBackgroundLayers = [baseLayers];//hàm trả về một list các layer

    }
    
    function initRasterLayers(layersData, layerTitle) {//hàm tạo các layer có kiểu là raster
        if (layersData) {//nếu layersData tồn tại
            var layerList = [];
            layersData.forEach((data) => {//lặp qua các phần tử trong layerData
                var layerName = data.name
                var mapURL = MAP_BASE_URL + global.appConfig.urlGWC;//lấy url từ geoserver
                
                let source = new ol.source.XYZ({
                    url: mapURL + global.appConfig.WMTSService +
                        `layer=${data.geserver_id}` + 
                        `&style=` + 
                        `&tilematrixset=EPSG%3A900913` + 
                        `&Service=WMTS` + 
                        `&Request=GetTile` + 
                        `&Version=1.0.0&` +
                        `Format=image%2Fpng` + 
                        `&TileMatrix=EPSG%3A900913%3A{z}&TileCol={x}&TileRow={y}` + 
                        `&exceptions=application%2Fvnd.ogc.se_xmls`,
                    crossOrigin: 'anonymous'
                })
                
                let layer = new ol.layer.Tile({
                    title: data.title,
                    visible: !!data.visible,
                    source: source
                });
                
                layerList.push(layer)
            })
            
            var neopolishLayers = new ol.layer.Group(
                {
                    title: layerTitle,
                    openInLayerSwitcher: false,
                    visible: false, //-----------------------
                    layers: layerList
                }
            )
        
            return mapNeopolishLayers = [neopolishLayers]
        }
    }

    function initLayers(layersData) { //Thêm các layer 

        if (layersData) {//nếu layersData tồn tại
 
            var tmpLayersData = {}; //tạo một obj 

            var layerGroups = {}; //tạo một obj chứa layerGroups

            var layerGroupByGroups = {};

            for (var i in layersData) {

                let l = layersData[i];//tạo l gán cho lớp i
                tmpLayersData[l.id + "_" + (i + 1)] = l;//tạo ra phần tử trong tmpLayersData["propert:public.HMDA_Master_Plan_1] = l

                layerGroups[l.groupID] = l.groupTitle;//layerGroups["HMDA Master Plan Zones"] = "HMDA Master Plan Zones"

                var group = layerGroupByGroups[l.groupID];//group = layerGroupByGroups["HMDA Master Plan Zones"]

                if (!group) {//nếu group tồn tại

                    /*
                     * create a new group
                     */

                    group = layerGroupByGroups[l.groupID] = [];//layerGroupByGroups["HMDA Master Plan Zones"]=[]
                }

                /*
                 *  and the current layer
                 */
                group.push(l);//group = [những phần tử trong data layer]
            }

            let layers = [];//tạo một mảng layers rỗng

            for (var groupId in layerGroupByGroups) { //lặp qua các phần tử trong layerGroupByGroups

                var listOfLayers = layerGroupByGroups[groupId];//lấy ra các phần tử trong layerGroupByGroups

                var listOfCreatedLayers = [];//tạo một mảng rỗng

                if (listOfLayers instanceof Array) {//nếu listOfLayers là một Array

                    for (var j in listOfLayers) {//lặp qua các key trong listOfLayers
                        var l = listOfLayers[j];//gán l cho phần tử j trong listOfLayers
                        
                        if(l.useCache){//nếu useCache == true
                            listOfCreatedLayers.push(createlayer(GWC_URL, l));                            
                        } else{//ngược lại nêu useCache == false
                            listOfCreatedLayers.push(createlayer(WMS_URL, l));
                        }
                    }
                    layers.push(//push các layer vào 1 group
                            new ol.layer.Group({
                                title: layerGroups[groupId],
                                openInLayerSwitcher: false,
                                layers: listOfCreatedLayers
                            })
                            );
                }
            }
            return mapVectorLayers = layers;
        }

    }

    

    function updateParams(layerId, params){
         
        var l = layers[layerId];
        
        if(!l){
             return false;
        }
        
        l.getSource().updateParams(params);
       
       return true;
        
    }

    function addParcelLayer(layerName, geomList, map, styleFill, styleLine) {
        var features = [];
        geomList.forEach(function(geom) {
            var feature = new ol.Feature({
                geometry: geom
            });
            features.push(feature);
        });
        
        var vectorSource = new ol.source.Vector({
            features: features
        });
        
        var resolution = map.getView().getResolution();

        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                color: styleLine,
                width: 2
                }),
                fill: new ol.style.Fill({
                color: styleFill
                }),
            }),
            name: layerName
        });
                                              
        map.addLayer(vectorLayer);
    }
    //Create survey layer
    function initSurveyLayer(dataLayer){
      let layerMap =[];
      var geoserver_id;
      var layerName;
      var visible;
      var newGeoserver = global.appConfig.newGeoserverURL;
    
      dataLayer.forEach((data)=>{
          console.log(data)
        var styleLayer;
        layerName = data.name
        visible = data.visible
        geoserver_id = data.geoserver_id
        if (geoserver_id == 'gis:survey'){
          styleLayer = new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'green',
                width: 1,
              }),
              fill: new ol.style.Fill({
                color: 'rgba(0,255,0,0.1)',
             }),
            zIndex: 5
          });
           
          
          // styleLayer =
            // [
            //   {
            //     filter: ['==', ['get','forsale'], 1],
            //     style:{
            //       'fill-color':'blue',
            //     },
            //   }
            // ]
        }else if(geoserver_id=='gis:non_survey'){
          styleLayer = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'red',
              width: 1,
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.1)',
            }),
            zIndex: 4
            
          });
        }
        var url = newGeoserver
                  + '/gwc/service/tms/1.0.0/'
                  +geoserver_id
                  +'@EPSG%3A900913'
                  +'@pbf/{z}/{x}/{-y}.pbf'
    
        layerMap.push(new ol.layer.VectorTile({
          declutter: true,
          source: new ol.source.VectorTile({
            maxZoom: 15,
            format: new ol.format.MVT({
            //   idProperty: 'gis_id',
            }),
            url:url,
          }),
          style: styleLayer,
          visible:visible,
          name:layerName
        })
        )
        })
      return layerMap
    }
    
    function createFeatureStyle(style_id, map) {//tạo style cho feature building point
        // var resolution = map.getView().getResolution();
        //  `${unitType}-${forSale}-${forRent}-${catId}`,
        var imageMapping = {
            '0-0-0-1': apiUrl+'/public/webgis/images/icon_commercial_one.png',
            '0-0-1-1': apiUrl+'/public/webgis/images/icon_commercial_rent.png',
            '0-1-0-1': apiUrl+'/public/webgis/images/icon_commercial_sale.png',
            '1-0-0-1': apiUrl+'/public/webgis/images/icon_commercial_vacant.png',

            '0-0-0-2': apiUrl+'/public/webgis/images/icon_gated_community_one.png',
            '0-0-1-2': apiUrl+'/public/webgis/images/icon_residency_rent.png',
            '0-1-0-2': apiUrl+'/public/webgis/images/icon_residency_sale.png',
            '1-0-0-2': apiUrl+'/public/webgis/images/icon_residency_vacant.png',

            '0-0-0-7': apiUrl+'/public/webgis/images/icon_gated_community_one.png',
            '0-0-1-7': apiUrl+'/public/webgis/images/icon_gated_community_rent.png',
            '0-1-0-7': apiUrl+'/public/webgis/images/icon_gated_community_sale.png',
            '1-0-0-7': apiUrl+'/public/webgis/images/icon_gated_community_vacant.png',

            '0-0-0-3': apiUrl+'/public/webgis/images/icon_multiunit_one.png',
            '0-0-1-3': apiUrl+'/public/webgis/images/icon_multiunit_rent.png',
            '0-1-0-3': apiUrl+'/public/webgis/images/icon_multiunit_sale.png',
            '1-0-0-3': apiUrl+'/public/webgis/images/icon_multiunit_vacant.png',

            '0-0-0-4': apiUrl+'/public/webgis/images/icon_plot_land_one.png',
            '0-0-1-4': apiUrl+'/public/webgis/images/icon_plot_land_rent.png',
            '0-1-0-4': apiUrl+'/public/webgis/images/icon_plot_land_sale.png',
            '1-0-0-4': apiUrl+'/public/webgis/images/icon_plot_land_vacant.png',

            '0-0-0-5': apiUrl+'/public/webgis/images/icon_under_construction_one.png',
            '0-0-1-5': apiUrl+'/public/webgis/images/icon_under_construction_rent.png',
            '0-1-0-5': apiUrl+'/public/webgis/images/icon_under_construction_sale.png',
            '1-0-0-5': apiUrl+'/public/webgis/images/icon_under_construction_vacant.png',

            '0-0-0-6': apiUrl+'/public/webgis/images/icon_demolished_one.png',   
            
        };//Tạo một obj chứa tất cả trường hợp để trả về đúng logo
    
        var imagePath = imageMapping[style_id] || apiUrl+'/public/webgis/images/icon_commercial_one.png';//nếu không nằm trong list thì mặc định là ...
        var iconImage = new Image();//Tạo một đối tượng Image
        iconImage.src = imagePath;//gán src cho đối tượng

        return new Promise((resolve) => {//Tạo một promise để khi load xong các hình ảnh trước khi các điểm này được tạo
            iconImage.onload = function () {
                
                // Fix Me
                // var referenceResolution = 20;
                // var scale = referenceResolution / resolution;
                
                resolve(
                    new ol.style.Style({
                        image: new ol.style.Icon({
                            img: iconImage,
                            imgSize: [85, 100],
                            scale: 0.5,
                        }),
                    })
                )
            }
        })
    }

    function addBuildingLayer(layerName, centroidList, map) {//hàm tạo lớp buildingLayer (gán vào 3 tham số: tên layer, list dữ liệu layer, map)
        var features = [];
        
        centroidList.forEach(function(data) {//lặp qua danh sách các dữ liệu
            var feature = new ol.Feature({	//tạo đối tượng Feature mới
                geometry: data.point,		//thêm các trường dữ liệu cho Feature
                gis_id: data.gis_id,
                style_id:data.style_id
            });
            createFeatureStyle(data.style_id, map).then(function (style) {	//Tạo style khi đối tượng có style_id
                feature.setStyle(style);	//Set style cho mỗi đối tượng
            });
            
            features.push(feature);	//Thêm các đối tượng vào mảng features
        });
        
        var vectorSource = new ol.source.Vector({	//Tạo source vector từ mảng features
            features: features
        });
        
        var vectorLayer = new ol.layer.Vector({		//Tạo lớp vector lấy source được tạo ở phía trên (có thể bỏ đoạn code này)
            source: vectorSource,
            name: layerName,
        });
        
        var clusterSource = new ol.source.Cluster({	//Tạo source cluster từ các điểm
            distance: 40,	//khoảng cách để gom các điểm lại là 40
            source: vectorSource, //Source được tạo ở phía trên
        });
        
        var styleCache = {};	//tạo một obj để chứa style
        var maxRadius = 20;	//tạo một biến mặc định là bán kính của vòng tròn điểm
        
        var clusterLayer = new ol.layer.Vector({	//tạo lớp layer hiển thị lớp cluster lên map
            source: clusterSource,	//gán source cluster
            style: function (feature) {		//style là một function
                var size = feature?.get('features').length;	//thay đổi size tuỳ vào số lượng các điểm tại khu vực đó
                var baseRadius = 10;
                var radius = baseRadius + size * 1.5;	//Vòng tròn điểm sẽ thay đổi nếu size lớn
                
                var textSize = Math.min(16, 8 + size)+2;	//size cũng sẽ thay đổi theo số lượng các điểm
                radius = Math.min(radius, maxRadius)+2;
                
                if (size === 1) { 	//nếu size bằng 1 thì sẽ gán icon cho điểm
                    return feature.get('features')[0].getStyle();
                } else {
                    var style = styleCache[size];	//nếu lớn hơn 1 sẽ hiển thị các radius của cluster
                    
                    if (!style) {	//kiểm tra xem style có tồn tại trong styleCache không
                        style = new ol.style.Style({	//Nếu chưa tồn tại tạo một style mới
                            image: new ol.style.Circle({
                                radius: radius,
                                stroke: new ol.style.Stroke({
                                    color: 'rgb(141, 143, 178)',
                                    width: 1,
                                }),
                                fill: new ol.style.Fill({
                                    color: 'rgb(255, 255, 255)', 
                                }),
                            }),
                            text: new ol.style.Text({
                                text: size?.toString(),
                                fill: new ol.style.Fill({
                                    color: 'rgb(141, 143, 178)',
                                }),
                                stoke: new ol.style.Stroke({
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    width: 3,
                                }),
                                font: 'bold ' + textSize + 'px Arial',
                            }),
                            zIndex: 1
                        });
                        var shadowStyleOut = new ol.style.Style({	//tạo hiệu ứng bóng ngoài cho điểm
                            image: new ol.style.Circle({
                                radius: radius + 2, 
                                fill: new ol.style.Fill({
                                    color: 'rgba(141, 143, 178, 0.1)', 
                                }),
                            }),
                            zIndex: 0 
                        });
                        var shadowStyleIn = new ol.style.Style({	//tạo hiệu ứng bóng trong cho điểm
                            image: new ol.style.Circle({
                                radius: radius - 1, 
                                fill: new ol.style.Fill({
                                    color: 'rgba(255, 255, 255, 0)', 
                                }),
                                stroke: new ol.style.Stroke({
                                    color: 'rgba(141, 143, 178, 0.2)',
                                    width:3,
                                })
                            }),
                            zIndex: 2 
                        });
                        style = [shadowStyleIn, shadowStyleOut, style];		//gán style cho layer
                        styleCache[size] = style;
                    }
                    return style;
                    }
                }
        });

        clusterLayer.set('name', layerName);
        clusterLayer.setZIndex(7);
        map.addLayer(clusterLayer);
        
    }
    
    function removeLayer (layerName, map) { //hàm gỡ layer ra khỏi map, tham số truyền vào sẽ là tên layer và đối tượng map
        var layerRemoved = map.getLayers().getArray().find(layer => layer.get('name') === layerName);		//tìm layer từ tên layer
        if (layerRemoved) {	//nếu layer tồn tại
              map.removeLayer(layerRemoved);	//remove layer ra khỏi map
        }
    }
    
    function zoomToLayer(extent, map) {		//hàm phóng đến một layer, tham số truyền vào là extent của đối tượng và map
        map.getView().fit(extent, {	//hướng đến giới hạn toạ độ được truyền vào
            size: map.getSize(),
            padding:[10,10,10,10],
            nearest: false,
            duration: 500
        });
    }
    
    function setVisibleParcelLayer(map, option) {
        var layerGroup = map.getLayers().getArray().find(layer => layer.get('title') === 'Layers');
        if (layerGroup instanceof ol.layer.Group) {
            var parcelLayer = layerGroup.getLayers().getArray().find(layer => layer.get('title') === "Propery");
            if (parcelLayer) {
                parcelLayer.setVisible(option);
            }
        }
    }
    
    function updateBuildingList(buildingList, buildingLayerName, geometryPoint) {	//không sử dụng
        var point = format.readGeometry(geometryPoint);
        var catId = data.cat_id === null ? 0 : data.cat_id
    }
    
    function handleHighlightLayer(dataList, map, styleFill, styleLine, polygonLayerName, buildingLayerName) {	//hàm được sử dụng để tạo các lớp survey, nonsurvey, building point từ API
        var extent = ol.extent.createEmpty();	//tạo một extent rỗng khi chạy hàm
        // var geomList = [];
        var buildingList = []	//tạo array buildingList rỗng để chứa các dữ liệu
        
        dataList.forEach(function(data) {	//lặp qua các phần tử trong datalist được truyền vào
            var format = new ol.format.WKT();	//đặt format là WKT (để đọc hiểu trường geometry có giá trị(MULTIPOLYGON(....))
            // if (data.polygon !== null) {
            //     var polygon = format.readGeometry(data.polygon);
            //     geomList.push(polygon);
            // }
            
            var point						//tạo biến point
            var gis_id = data.gis_id ? data.gis_id : null;	//nếu gis_id trong data tồn tại thì gán cho gis_id ngược lại là null
            var surveypoint = data.survey_point;		//lấy centroiPoint
            var centroidPoint = data.centroid_point;
            var catId = data.cat_id === null ? 0 : data.cat_id;		//nếu cat_id trong data tồn tại thì gán cho cat_id ngược lại là null	
            var forSale = data.for_sale === null ? 0 : data.for_sale;	//nếu for_sale trong data tồn tại thì gán cho forSale ngược lại là null
            var forRent = data.for_rent === null ? 0 : data.for_rent;	//nếu for_rent trong data tồn tại thì gán cho forRent ngược lại là null
            var unitType = data.unit_type === null ? 0 : data.unit_type;//nếu unit_type trong data tồn tại thì gán cho unitType ngược lại là null
            
            if (buildingLayerName !== null && centroidPoint !== null) {		//Kiểm tra nếu buildingLayerName khác null và centroipoint khác null
                point = format.readGeometry(centroidPoint);			//lấy geometry là centroiPoint (Định nghĩa lại)
            } else if (buildingLayerName !== null && surveypoint !== null) {
                point = format.readGeometry(surveypoint);			//ngược lại nếu surveypoitn tồn tại thì lấy geometry là surveypoint
            }
            	
            if (point) {							//Nếu point tồn tại
                buildingList.push({						//push các đối tượng point vào buildingList
                    'style_id': `${unitType}-${forSale}-${forRent}-${catId}`,	//gán style id bằng cách tạo chuỗi bằng các biến (cat_id, forSale, forRent, unitType)
                    'gis_id': gis_id,						//gán gis_id
                    'point': point						//trường point là các toạ độ được định nghĩa
                })
            }
            if (dataList.length === 1 && buildingList.length > 0) { 	//nếu datalist truyền vào chỉ có 1 giá trị
                map.getView().setCenter(buildingList[0].point.getCoordinates()); //zoom đến giá trị đó
                map.getView().setZoom(15);
             }
            // ol.extent.extend(extent, polygon.getExtent());
        });
        setVisibleParcelLayer(map, false);
        //addParcelLayer(polygonLayerName, geomList, map, styleFill, styleLine);
        if (buildingLayerName !== null) {
            addBuildingLayer(buildingLayerName, buildingList, map);
        }
        //zoomToLayer(extent, map);
    }
    
    function clearSurveyAndNonSurveyLayer (map) { //hàm được sử dụng để remove các layer
        var layerList = ['Survey Point', 'Survey Polygon', 'Not Survey Point', 'Not Survey Polygon']
        layerList.forEach(function(lay) {
            removeLayer(lay, map);
        })
    }
    
    function pointClickIconStyle (point) {	//hàm này sẽ tạo ra một icon khi click vào bản đồ
        // Define the icon style
        var svgIcon = new Image();		//tạo một image mới
        var labelText = point.get('label');	//lấy ra label trong đối tượng truyền vào
        svgIcon.src = apiUrl + '/public/webgis/images/others.png';	//gán src image

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
              img: svgIcon,
              imgSize: [85, 100],
              scale: 0.6,
            }),
            text: new ol.style.Text({	//tạo label hiển thị cho điểm đó
                text: labelText || '',
                font: 'bold 10px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: 'black',
                }),
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2,
                }),
                offsetX: 110,	//vị trí sẽ nằm trên icon
            }),
        });

        return iconStyle;
    }
    
    async function addPointClickedLayer(map, point) {	//hàm này được khởi toạ khi nhấp vào một điểm trên map
        var vectorSource = new ol.source.Vector();	//tạo một source Vector mới

        var iconStyle = await pointClickIconStyle(point);	//iconStyle được chạy khi hàm pointClickIconStyle được hoàn thành
        point.setStyle(iconStyle);	//setStyle cho đối tượng point
        
        vectorSource.addFeature(point);	//thêm feature với style được hiển thị vào src

        var vectorLayer = new ol.layer.Vector({	//tạo một lớp layer từ vectorSource
            source: vectorSource,
            name: 'Point-Clicked'
        });
        
        map.addLayer(vectorLayer);
    }
    
    function addPointSearchLayer(map, pointList, iconURL, bbox) {	//hàm này sẽ thêm đối tượng được tìm thấy bằng gg search vào trong map
        var vectorSource = new ol.source.Vector({																		
            projection: 'EPSG:900913',
        });
        
        vectorSource.addFeatures(pointList);
        
        var vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          style: function(feature) {
              return new ol.style.Style({
                image: new ol.style.Icon({
                  src: iconURL,
                  imgSize: [85, 100],
                  scale: 0.6,
                }),
                text: new ol.style.Text({
                    text: feature?.get('label'),
                    font: 'bold 10px Calibri,sans-serif',
                    fill: new ol.style.Fill({
                        color: 'black',
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'white',
                        width: 2,
                    }),
                    offsetY: 20,
                }),
              })
          },
          name: 'Point-Searched'
        });
        
        map.addLayer(vectorLayer);
        
        // if (bbox.length !== 0) {
        //     const extent = ol.proj.transformExtent(bbox, 'EPSG:4326', 'EPSG:900913');
        //     map.getView().fit(extent, map.getSize());
        // } else {
        //     var extent = vectorSource.getExtent();
        //     map.getView().fit(extent, {
        //         padding: [40, 40, 40, 40],
        //         duration: 1000 
        //     });
            
        // }
        
    }
    
    function addMorePointSearchFeature(map, pointList) { //thêm điểm mới
        var pointSearchLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'Point-Searched');
        pointSearchLayer.getSource().addFeatures(pointList);
    }
    
    function addLabelLayer(map, label, feature, mouseCoords) { //hàm này tạo label khi hover vào đối tượng trên map (tham số: map, tên layer, feature, toạ độ tại vị trí chuột)
        var vectorSource = new ol.source.Vector({
            projection: 'EPSG:900913',
        });
        vectorSource.addFeature(feature);	//thêm feature vào src vector
        var labelVectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                text: new ol.style.Text({
                    text: label,
                    font: 'bold 13px Calibri,sans-serif',
                    fill: new ol.style.Fill({
                        color: 'black',
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'white',
                        width: 2,
                    }),
                }),
                geometry: new ol.geom.Point(mouseCoords) 	//tạo điểm tại vị trí chuột để hiển thị layer
            }),
            name: 'Label'
        });
        map.addLayer(labelVectorLayer);
    }
    
    function addHighlightLineLayer (map, feature) { //zoom đến vị trí khi hover vào feature, hightlight đối tượng được hover vào
		let zoom = map.getView().getZoom();
        let width = zoom < 9 ? 4.5
                    : zoom < 10 ? 4
                    : zoom < 11 ? 3.5
                    : zoom < 12 ? 3
                    : 2.5
                    
        var vectorSource = new ol.source.Vector({
            projection: 'EPSG:900913',
        });
        
        vectorSource.addFeature(feature);
        var highlightLineLayer = new ol.layer.Vector({
            source: vectorSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: width,
                })
            }),
            name: 'Highlight'
        });
        map.addLayer(highlightLineLayer);
    }

    function addMetroPopupLayer(map) { //hàm này để hiển thị các popup của metro (không còn sử dụng)
        var mapURL = MAP_BASE_URL + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=gis:Metro_locations&outputFormat=application%2Fjson";
        var svgIcon = new Image();
        svgIcon.src = apiUrl + '/public/webgis/images/popup-2.png';
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({				 
			    url: mapURL,
				format: new ol.format.GeoJSON()
			}),
			style: function(feature) {
			    var label = feature.get('name');
			    
			    return new ol.style.Style({
			        image: new ol.style.Icon({
                        img: svgIcon,
                        imgSize: [500, 500],
                        scale: 0.16,
                        opacity: 0.6,
                        offsetY: -500,
                    }),
			        text: new ol.style.Text({
                        text: label,
                        font: 'bold 12px Calibri,sans-serif',
                        fill: new ol.style.Fill({
                            color: 'white',
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'black',
                            width: 2,
                        }),
                        offsetY: -16,
                    }),
			    })
			},
			name: "Metro Location Label"
		});
		map.addLayer(vectorLayer)
        
    }
    
    var obj = {
        initSurveyLayer:initSurveyLayer,
        initBackgroundLayers: initBackgroundLayers,
        initRasterLayers: initRasterLayers,
        initLayers: initLayers,
        layers: layers,
        updateParams: function(){
            return updateParams.apply(this, arguments);
        },
        handleHighlightLayer: function(){
            return handleHighlightLayer.apply(this, arguments);
        },
        clearSurveyAndNonSurveyLayer: function(){
            return clearSurveyAndNonSurveyLayer.apply(this, arguments);
        },
        addPointClickedLayer: function(){
            return addPointClickedLayer.apply(this, arguments);
        },
        addPointSearchLayer: function() {
            return addPointSearchLayer.apply(this, arguments);
        },
        addLabelLayer: function() {
            return addLabelLayer.apply(this, arguments);
        },
        addHighlightLineLayer: function() {
            return addHighlightLineLayer.apply(this, arguments);
        },
        addMetroPopupLayer: function() {
            return addMetroPopupLayer.apply(this, arguments);
        },
        addMorePointSearchFeature: function() {
            return addMorePointSearchFeature.apply(this, arguments);
        },
        removeLayer: function(){
            return removeLayer.apply(this, arguments);
        },
        initSurveyLayer:function(){
            return initSurveyLayer.apply(this,arguments);
        },
    };

    global.layerController = obj;

})(window.GISApp, jQuery);

;
