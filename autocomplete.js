let map;
let azureSearchDataSource;
let azureMapDataSource;
const mapCenter = [-73.985130, 40.758896]
const defaultZoom = 15;

function initializeMap() {
    map = new atlas.Map('mapControl', {
        center: mapCenter,
        zoom: defaultZoom,
        authOptions: {
            authType: "subscriptionKey",
            subscriptionKey: azureKey
        }
    });

    map.events.add('ready', function () {
        azureMapDataSource = new atlas.source.DataSource();
        map.sources.add(azureMapDataSource);
        map.layers.add(new atlas.layer.SymbolLayer(azureMapDataSource));
        azureMapDataSource.add(new atlas.data.Point(mapCenter));
    })
}

$(() => {

    azureSearchDataSource = new kendo.data.DataSource({
        serverFiltering: true,
        transport: {
            read: {
                url: "https://atlas.microsoft.com/search/poi/json?typeahead=true&api-version=1&view=Auto&language=en-US&countrySet=US&subscription-key=" + azureKey,
                type: "get",
                dataType: "json",
                data: function() {
                    var center = map.getCamera().center;
                    var searchTerm = $("#queryText").data("kendoAutoComplete").value();
                    return {
                        lon: center[0],
                        lat: center[1],
                        query: searchTerm
                    }
                }
            }
        },
        schema: {
            type: "json",
            data: function(response) {
                return response.results;
            },
            model: {
               id: "id"
            }
        }
    })

    $('#queryText').kendoAutoComplete({
        minLength: 3,
        placeholder: "Select a venue",
        dataValueField: "id",
        dataTextField: "poi.name",
        template: $('#autoCompleteItemTemplate').html(),
        dataSource: azureSearchDataSource,
        select: function (e) {
            var item = e.dataItem;
            console.log(item.poi.name);
            
            map.setCamera({
                center: [item.position.lon, item.position.lat],
                zoom: defaultZoom});
            azureMapDataSource.add(new atlas.data.Point([item.position.lon, item.position.lat]));
        }
    });
    initializeMap();

});