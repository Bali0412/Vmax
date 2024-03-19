(function (global, $) {

    var MAP_BASE_URL = global.appConfig.geoserverURL;
    var GWC_URL = MAP_BASE_URL + global.appConfig.urlGWC;
    var WMS_URL = MAP_BASE_URL + global.appConfig.urlWMS;

    let layers = {};

    var mapVectorLayers = [];
    var mapBackgroundLayers = [];
    var mapNeopolishLayers = [];

    function createlayer(mapURL, layerObj) {
        tile = !!layerObj.tile;
        var layer = null;
        var source = null;
        var styles = layerObj.styles || undefined;
        var metroFeatures = []

        var params = {
            LAYERS: layerObj.layers,
            SRS: layerObj.srs || global.appConfig.mapProjection,
            VERSION: layerObj.serviceVersion,
            STYLES: styles
        }
        
		if(layerObj.vector) {
			mapURL = MAP_BASE_URL + "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + layerObj.geserver_id + "&outputFormat=application%2Fjson";
			
			layer = new ol.layer.Vector({
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
            if (layerObj.GWCservice === 'WMTS') {
                
                source = new ol.source.XYZ({
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
            else {
                source = new ol.source.TileWMS({
                    url: mapURL + global.appConfig.WMSService,
                    params: params,
                    serverType: layerObj.serverType || 'geoserver'
                })
            }
            // Handle Layer Tile
			if (tile) {

            layer = new ol.layer.Tile({
                title: layerObj.title,
                visible: !!layerObj.visible,
                source: source
            });

			} else {

				layer = new ol.layer.Image({
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

        return layers[layerObj.id] = layer;
    }


    function initBackgroundLayers() {

        // var roadmapLayer = new olgm.layer.Google({
        //     title: "Google street map",
        //     mapTypeId: google.maps.MapTypeId.ROADMAP
        // });

        // var hybridlayer = new olgm.layer.Google({
        //     title: "Google earth map",
        //     mapTypeId: google.maps.MapTypeId.HYBRID,
        //     visible: false
        // });

        var baseLayers = new ol.layer.Group(
                {title: 'Base Layers',
                    openInLayerSwitcher: false,
                    visible: true,
                    layers:
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
        return mapBackgroundLayers = [baseLayers];

    }
    
    function initRasterLayers(layersData, layerTitle) {
        if (layersData) {
            var layerList = [];
            layersData.forEach((data) => {
                var layerName = data.name
                var mapURL = MAP_BASE_URL + global.appConfig.urlGWC;
                
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

    function initLayers(layersData) {

        if (layersData) {

            var tmpLayersData = {};

            var layerGroups = {};

            var layerGroupByGroups = {};

            for (var i in layersData) {

                let l = layersData[i];
                tmpLayersData[l.id + "_" + (i + 1)] = l;

                layerGroups[l.groupID] = l.groupTitle;

                var group = layerGroupByGroups[l.groupID];

                if (!group) {

                    /*
                     * create a new group
                     */

                    group = layerGroupByGroups[l.groupID] = [];
                }

                /*
                 *  and the current layer
                 */
                group.push(l);
            }

            let layers = [];

            for (var groupId in layerGroupByGroups) {

                var listOfLayers = layerGroupByGroups[groupId];

                var listOfCreatedLayers = [];

                if (listOfLayers instanceof Array) {

                    for (var j in listOfLayers) {
                        var l = listOfLayers[j];
                        
                        if(l.useCache){
                            listOfCreatedLayers.push(createlayer(GWC_URL, l));                            
                        } else{
                            listOfCreatedLayers.push(createlayer(WMS_URL, l));
                        }
                    }
                    layers.push(
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
    
    function createFeatureStyle(style_id, map) {
        var resolution = map.getView().getResolution();
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
            
        };
    
        var imagePath = imageMapping[style_id] || apiUrl+'/public/webgis/images/icon_commercial_one.png';
        var iconImage = new Image();
        iconImage.src = imagePath;

        return new Promise((resolve) => {
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

    function addBuildingLayer(layerName, centroidList, map) {
        var features = [];
        
        centroidList.forEach(function(data) {
            var feature = new ol.Feature({
                geometry: data.point,
                gis_id: data.gis_id,
                style_id:data.style_id
            });
            createFeatureStyle(data.style_id, map).then(function (style) {
                feature.setStyle(style);
            });
            
            features.push(feature);
        });
        
        var vectorSource = new ol.source.Vector({
            features: features
        });
        
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            name: layerName,
        });
        
        var clusterSource = new ol.source.Cluster({
            distance: 40,
            source: vectorSource,
        });
        
        var styleCache = {};
        var maxRadius = 20;
        
        var clusterLayer = new ol.layer.Vector({
            source: clusterSource,
            style: function (feature) {
                var size = feature?.get('features').length;
                var baseRadius = 10;
                var radius = baseRadius + size * 1.5;
                
                var textSize = Math.min(16, 8 + size)+2;
                radius = Math.min(radius, maxRadius)+2;
                
                if (size === 1) {
                    return feature.get('features')[0].getStyle();
                } else {
                    var style = styleCache[size];
                    
                    if (!style) {
                        style = new ol.style.Style({
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
                        var shadowStyleOut = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: radius + 2, 
                                fill: new ol.style.Fill({
                                    color: 'rgba(141, 143, 178, 0.1)', 
                                }),
                            }),
                            zIndex: 0 
                        });
                        var shadowStyleIn = new ol.style.Style({
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
                        style = [shadowStyleIn, shadowStyleOut, style];
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
    
    function removeLayer (layerName, map) {
        var layerRemoved = map.getLayers().getArray().find(layer => layer.get('name') === layerName);
        if (layerRemoved) {
              map.removeLayer(layerRemoved);
        }
    }
    
    function zoomToLayer(extent, map) {
        map.getView().fit(extent, {
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
    
    function updateBuildingList(buildingList, buildingLayerName, geometryPoint) {
        var point = format.readGeometry(geometryPoint);
        var catId = data.cat_id === null ? 0 : data.cat_id
    }
    
    function handleHighlightLayer(dataList, map, styleFill, styleLine, polygonLayerName, buildingLayerName) {
        var extent = ol.extent.createEmpty();
        // var geomList = [];
        var buildingList = []
        
        dataList.forEach(function(data) {
            var format = new ol.format.WKT();
            // if (data.polygon !== null) {
            //     var polygon = format.readGeometry(data.polygon);
            //     geomList.push(polygon);
            // }
            
            var point
            var gis_id = data.gis_id ? data.gis_id : null;
            var surveypoint = data.survey_point;
            var centroidPoint = data.centroid_point;
            var catId = data.cat_id === null ? 0 : data.cat_id;
            var forSale = data.for_sale === null ? 0 : data.for_sale;
            var forRent = data.for_rent === null ? 0 : data.for_rent;
            var unitType = data.unit_type === null ? 0 : data.unit_type;
            
            if (buildingLayerName !== null && centroidPoint !== null) {
                point = format.readGeometry(centroidPoint);
            } else if (buildingLayerName !== null && surveypoint !== null) {
                point = format.readGeometry(surveypoint);
            }
            
            if (point) {
                buildingList.push({
                    'style_id': `${unitType}-${forSale}-${forRent}-${catId}`,
                    'gis_id': gis_id,
                    'point': point
                })
            }
            if (dataList.length === 1 && buildingList.length > 0) {
                map.getView().setCenter(buildingList[0].point.getCoordinates());
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
    
    function clearSurveyAndNonSurveyLayer (map) {
        var layerList = ['Survey Point', 'Survey Polygon', 'Not Survey Point', 'Not Survey Polygon']
        layerList.forEach(function(lay) {
            removeLayer(lay, map);
        })
    }
    
    function pointClickIconStyle (point) {
        // Define the icon style
        var svgIcon = new Image();
        var labelText = point.get('label');
        svgIcon.src = apiUrl + '/public/webgis/images/others.png';

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
              img: svgIcon,
              imgSize: [85, 100],
              scale: 0.6,
            }),
            text: new ol.style.Text({
                text: labelText || '',
                font: 'bold 10px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: 'black',
                }),
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 2,
                }),
                offsetX: 110,
            }),
        });

        return iconStyle;
    }
    
    async function addPointClickedLayer(map, point) {
        var vectorSource = new ol.source.Vector();

        var iconStyle = await pointClickIconStyle(point);
        point.setStyle(iconStyle);
        
        vectorSource.addFeature(point);

        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            name: 'Point-Clicked'
        });
        
        map.addLayer(vectorLayer);
    }
    
    function addPointSearchLayer(map, pointList, iconURL, bbox) {
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
    
    function addMorePointSearchFeature(map, pointList) {
        var pointSearchLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'Point-Searched');
        pointSearchLayer.getSource().addFeatures(pointList);
    }
    
    function addLabelLayer(map, label, feature, mouseCoords) {
        var vectorSource = new ol.source.Vector({
            projection: 'EPSG:900913',
        });
        vectorSource.addFeature(feature);
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
                geometry: new ol.geom.Point(mouseCoords)
            }),
            name: 'Label'
        });
        map.addLayer(labelVectorLayer);
    }
    
    function addHighlightLineLayer (map, feature) {
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

    function addMetroPopupLayer(map) {
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