const infrastructureData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": "B001",
                "name": "若戸大橋 (Wakato Bridge)",
                "type": "Bridge",
                "installYear": 1962,
                "hazardLevel": 0.8, // Base hazard susceptibility
                "lastInspection": "2023-04"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [130.8055, 33.9072] // Wakato Bridge approx
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "S001",
                "name": "皿倉山林道法面 (Sarakura Slope)",
                "type": "Slope",
                "installYear": 1985,
                "hazardLevel": 0.9, // High landslide risk
                "lastInspection": "2024-01"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [130.7963, 33.8447] // Near Sarakurayama
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "T001",
                "name": "関門トンネル入口 (Kanmon Tunnel)",
                "type": "Tunnel",
                "installYear": 1958,
                "hazardLevel": 0.5,
                "lastInspection": "2023-11"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [130.9610, 33.9480] // Kanmon area
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "B002",
                "name": "紫川大橋 (Murasaki River Bridge)",
                "type": "Bridge",
                "installYear": 1990,
                "hazardLevel": 0.6,
                "lastInspection": "2022-08"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [130.875, 33.882] // Kokura center approx
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "U001",
                "name": "小倉駅地下雨水調整池",
                "type": "Underground",
                "installYear": 2005,
                "hazardLevel": 0.7,
                "lastInspection": "2024-02"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [130.882, 33.886] // Kokura Station
            }
        },
         {
            "type": "Feature",
            "properties": {
                "id": "S002",
                "name": "足立山麓法面 (Adachi Slope)",
                "type": "Slope",
                "installYear": 1970,
                "hazardLevel": 0.85,
                "lastInspection": "2023-05"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [130.900, 33.870] // Adachi area
            }
        }
    ]
};
