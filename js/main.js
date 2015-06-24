
var container, stats;
var camera, scene, renderer, raycaster, projector, INTERSECTED, directionalLight;
var surfaces = [];
var mouse = new THREE.Vector2();

mrt.occupant = {
    'position': {'x': 1, 'y': 1},
    'azimuth': 0.0, 
    'posture': 'seated',
};

mrt.room = {
    'depth': 5.0, 
    'width': 10.0, 
    'height': 2.6,
}

params = {
    'azimuth': 0,
    'opacity': 0,
    'wall1': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 8.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'wall2': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 36.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'wall3': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 38.0,
        'emissivity': 0.9,
        'width': 8.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'wall4': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 1.8,
        'xposition': 1.0,
        'yposition': 0.4,
      },
    },
    'ceiling': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 50.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 3.0,
        'xposition': 1.0,
        'yposition': 1.0,
      },
    },
    'floor': {
      'temperature': 21.0,
      'emissivity': 0.9,
      'panel': {
        'active': false,
        'temperature': 40.0,
        'emissivity': 0.9,
        'width': 3.0,
        'height': 3.0,
        'xposition': 1.0,
        'yposition': 1.0,
      },
    },
    'display': 'MRT',
    'autocalculate': true,
    'calculate now': function(){
      calculate_all();
    }
};

var view_factors;

function set_wall_properties(){
  mrt.walls = [
      {
          'name': 'wall1', 
          'temperature': params.wall1.temperature,
          'emissivity': params.wall1.emissivity,
          'plane': 'xz', // 'xy' plane for webgl geometry
          'u': mrt.room.width,
          'v': mrt.room.height,
          'offset': {'x': 0, 'y': 0, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'wall2', 
          'temperature': params.wall2.temperature,
          'emissivity': params.wall2.emissivity,
          'plane': 'yz', 
          'u': mrt.room.depth,
          'v': mrt.room.height,
          'offset': {'x': mrt.room.width, 'y': 0, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'wall3', 
          'temperature': params.wall3.temperature,
          'emissivity': params.wall3.emissivity,
          'plane': 'xz', 
          'u': mrt.room.width,
          'v': mrt.room.height,
          'offset': {'x': 0, 'y': mrt.room.depth, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'wall4', 
          'temperature': params.wall4.temperature,
          'emissivity': params.wall4.emissivity,
          'plane': 'yz', 
          'u': mrt.room.depth,
          'v': mrt.room.height,
          'offset': {'x': 0, 'y': 0, 'z': 0},
          'subsurfaces': [],
      },
      {
          'name': 'ceiling', 
          'temperature': params.ceiling.temperature,
          'emissivity': params.ceiling.emissivity,
          'plane': 'xy', 
          'u': mrt.room.width,
          'v': mrt.room.depth,
          'offset': {'x': 0, 'y': 0, 'z': mrt.room.height},
          'subsurfaces': [],
      },
      {
          'name': 'floor', 
          'temperature': params.ceiling.temperature,
          'emissivity': params.ceiling.emissivity,
          'plane': 'xy', 
          'u': mrt.room.width,
          'v': mrt.room.depth,
          'offset': {'x': 0, 'y': 0, 'z': 0},
          'subsurfaces': [],
      }
  ];

  var wall1 = _.find(mrt.walls, function(w){ return w.name === 'wall1' });
  if (params.wall1.panel.active){
    wall1.subsurfaces = [
        {
          'name': 'wall1panel1',
          'temperature': params.wall1.panel.temperature,
          'emissivity': params.wall1.panel.emissivity,
          'u': params.wall1.panel.xposition, 
          'v': params.wall1.panel.yposition,
          'width': params.wall1.panel.width,
          'height': params.wall1.panel.height,
      }
    ];
  }

  var wall2 = _.find(mrt.walls, function(w){ return w.name === 'wall2' });
  if (params.wall2.panel.active){
    wall2.subsurfaces = [
        {
          'name': 'wall2panel1',
          'temperature': params.wall2.panel.temperature,
          'emissivity': params.wall2.panel.emissivity,
          'u': params.wall2.panel.xposition, 
          'v': params.wall2.panel.yposition,
          'width': params.wall2.panel.width,
          'height': params.wall2.panel.height,
      }
    ];
  }

  var wall3 = _.find(mrt.walls, function(w){ return w.name === 'wall3' });
  if (params.wall3.panel.active){
    wall3.subsurfaces = [
        {
          'name': 'wall3panel1',
          'temperature': params.wall3.panel.temperature,
          'emissivity': params.wall3.panel.emissivity,
          'u': params.wall3.panel.xposition, 
          'v': params.wall3.panel.yposition,
          'width': params.wall3.panel.width,
          'height': params.wall3.panel.height,
      }
    ];
  }

  var wall4 = _.find(mrt.walls, function(w){ return w.name === 'wall4' });
  if (params.wall4.panel.active){
    wall4.subsurfaces = [
        {
          'name': 'wall4panel1',
          'temperature': params.wall4.panel.temperature,
          'emissivity': params.wall4.panel.emissivity,
          'u': params.wall4.panel.xposition, 
          'v': params.wall4.panel.yposition,
          'width': params.wall4.panel.width,
          'height': params.wall4.panel.height,
      }
    ];
  }

  var ceiling = _.find(mrt.walls, function(w){ return w.name === 'ceiling' });
  if (params.ceiling.panel.active){
    ceiling.subsurfaces = [
        {
          'name': 'ceilingpanel1',
          'temperature': params.ceiling.panel.temperature,
          'emissivity': params.ceiling.panel.emissivity,
          'u': params.ceiling.panel.xposition, 
          'v': params.ceiling.panel.yposition,
          'width': params.ceiling.panel.width,
          'height': params.ceiling.panel.height,
      }
    ];
  }

  var floor = _.find(mrt.walls, function(w){ return w.name === 'floor' });
  if (params.floor.panel.active){
    floor.subsurfaces = [
        {
          'name': 'floorpanel1',
          'temperature': params.floor.panel.temperature,
          'emissivity': params.floor.panel.emissivity,
          'u': params.floor.panel.xposition, 
          'v': params.floor.panel.yposition,
          'width': params.floor.panel.width,
          'height': params.floor.panel.height,
      }
    ];
  }

};

function gen_zone_geometry(){

    var wall1 = { 
        'vertices': [
          {'x': 0, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
          {'x': 0, 'y': mrt.room.height, 'z': 0}
        ],
        'name': 'wall1'
    };
    if (params.wall1.panel.active){
      var u0 = params.wall1.panel.xposition;
      var v0 = params.wall1.panel.yposition;
      var w = params.wall1.panel.width;
      var h = params.wall1.panel.height;

      // make sure the panel fits!

      wall1.children = [
        { 'vertices': [{'x': u0, 'y': v0, 'z': 0 },
                       {'x': u0, 'y': v0 + h, 'z': 0 },
                       {'x': u0 + w, 'y': v0 + h, 'z': 0 },
                       {'x': u0 + w, 'y': v0, 'z': 0 }],
          'radiant_t': params.wall1.panel.temperature,
          'emissivity': params.wall1.panel.emissivity,
          'name': 'wall1panel1'
        },
      ];
    } else {
      wall1.children = [];
    }

    var wall2 = {
        'vertices': [
          {'x': mrt.room.width, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth}
        ],
        'name': 'wall2'
    };
    if (params.wall2.panel.active){
      var u0 = params.wall2.panel.xposition;
      var v0 = params.wall2.panel.yposition;
      var w = params.wall2.panel.width;
      var h = params.wall2.panel.height;
      wall2.children = [
        { 'vertices': [{'x': mrt.room.width, 'y': v0, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 },
                       {'x': mrt.room.width, 'y': v0 + h, 'z': u0 + w },
                       {'x': mrt.room.width, 'y': v0, 'z': u0 + w }],
          'radiant_t': params.wall2.panel.temperature,
          'emissivity': params.wall2.panel.emissivity,
          'name': 'wall2panel1'
        },
      ];
    } else {
      wall2.children = [];
    }

    var wall3 = {
        'vertices': [
          {'x': 0, 'y': 0, 'z': mrt.room.depth},
          {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth}
        ],
        'name': 'wall3'
    };
    
    if (params.wall3.panel.active){
      var u0 = params.wall3.panel.xposition;
      var v0 = params.wall3.panel.yposition;
      var w = params.wall3.panel.width;
      var h = params.wall3.panel.height;
      wall3.children = [
        { 'vertices': [{'x': u0, 'y': v0, 'z': mrt.room.depth },
                       {'x': u0, 'y': v0 + h, 'z': mrt.room.depth },
                       {'x': u0 + w, 'y': v0 + h, 'z': mrt.room.depth },
                       {'x': u0 + w, 'y': v0, 'z': mrt.room.depth }],
          'radiant_t': params.wall3.panel.temperature,
          'emissivity': params.wall3.panel.emissivity,
          'name': 'wall3panel1',
        },
      ];
    } else {
      wall3.children = [];
    }
    

    var wall4 = {
        'vertices': [
          {'x': 0, 'y': 0, 'z': 0},
          {'x': 0, 'y': mrt.room.height, 'z': 0},
          {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': 0, 'y': 0, 'z': mrt.room.depth}
        ],
        'name': 'wall4'
    };

    if (params.wall4.panel.active){
      var u0 = params.wall4.panel.xposition;
      var v0 = params.wall4.panel.yposition;
      var w = params.wall4.panel.width;
      var h = params.wall4.panel.height;
      wall4.children = [
        { 'vertices': [{'x': 0, 'y': v0, 'z': u0 },
                       {'x': 0, 'y': v0 + h, 'z': u0 },
                       {'x': 0, 'y': v0 + h, 'z': u0 + w },
                       {'x': 0, 'y': v0, 'z': u0 + w }],
          'radiant_t': params.wall4.panel.temperature,
          'emissivity': params.wall4.panel.emissivity,
          'name': 'wall4panel1',
        },
      ];
    } else {
      wall4.children = [];
    }
    
    var ceiling = { 
        'vertices': [
          {'x': 0, 'y': mrt.room.height, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': 0},
          {'x': mrt.room.width, 'y': mrt.room.height, 'z': mrt.room.depth},
          {'x': 0, 'y': mrt.room.height, 'z': mrt.room.depth}
        ],
        'name': 'ceiling'
    };

    if (params.ceiling.panel.active){
      var u0 = params.ceiling.panel.xposition;
      var v0 = params.ceiling.panel.yposition;
      var w = params.ceiling.panel.width;
      var h = params.ceiling.panel.height;
      ceiling.children = [
        { 'vertices': [{'x': u0, 'y': mrt.room.height, 'z': v0 },
                       {'x': u0 + w, 'y': mrt.room.height, 'z': v0 },
                       {'x': u0 + w, 'y': mrt.room.height, 'z': v0 + h },
                       {'x': u0, 'y': mrt.room.height, 'z': v0 + h }],
          'radiant_t': params.ceiling.panel.temperature,
          'emissivity': params.ceiling.panel.emissivity,
          'name': 'ceilingpanel1',
        },
      ];
    } else {
      ceiling.children = [];
    }

    var floor = { 
        'vertices': [
          {'x': 0, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': 0, 'z': 0},
          {'x': mrt.room.width, 'y': 0, 'z': mrt.room.depth},
          {'x': 0, 'y': 0, 'z': mrt.room.depth}
        ],
       'name': 'floor'
    };

    if (params.floor.panel.active){
      var u0 = params.floor.panel.xposition;
      var v0 = params.floor.panel.yposition;
      var w = params.floor.panel.width;
      var h = params.floor.panel.height;
      floor.children = [
        { 'vertices': [{'x': u0, 'y': 0, 'z': v0 },
                       {'x': u0 + w, 'y': 0, 'z': v0 },
                       {'x': u0 + w, 'y': 0, 'z': v0 + h },
                       {'x': u0, 'y': 0, 'z': v0 + h }],
          'radiant_t': params.floor.panel.temperature,
          'emissivity': params.floor.panel.emissivity,
          'name': 'floorpanel1',
        },
      ];
    } else {
      floor.children = [];
    }

    var myZone = [ wall1, wall2, wall3, wall4, ceiling, floor ];
    return myZone;
}

function wallPanelGeometry(vertices){
  var Nv = vertices.length;
  var geometry = new THREE.Geometry();
  for (var j = 0; j < Nv; j++){
    geometry.vertices.push(new THREE.Vector3( vertices[j].x, vertices[j].y, vertices[j].z ))
  }
  for (var j = 0; j < Nv - 2; j++){
    var face = new THREE.Face3( 0, j+1, j+2 )
    geometry.faces.push(face);
  }
  return geometry;
}

function wallPanelMesh(geometry){
  var material = new THREE.MeshPhongMaterial( { 
      color: 0xffffff, 
      reflectivity: 100, 
      transparent: true, 
      opacity: 1.0 
  } );
  material.side = THREE.DoubleSide;
  var uva = new THREE.Vector2(0,0);
  var uvb = new THREE.Vector2(0,1);
  var uvc = new THREE.Vector2(1,1);
  var uvd = new THREE.Vector2(1,0);

  geometry.faceVertexUvs[0].push([uva, uvb, uvc])
  geometry.faceVertexUvs[0].push([uva.clone(), uvc, uvd.clone()])
  geometry.computeFaceNormals();

  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function remove_zone() {
  var objsToRemove = _.rest(scene.children, 3);
  _.each(objsToRemove, function( object ) {
      scene.remove(object);
  });
}

function render_zone(){

  // Grid

  var step = 1;
  var geometry = new THREE.Geometry();
  for ( var i = 0; i <= mrt.room.depth; i += step ) {
    geometry.vertices.push( new THREE.Vector3( 0, 0, i ) );
    geometry.vertices.push( new THREE.Vector3( mrt.room.width, 0, i ) );
  }
  for ( var i = 0; i <= mrt.room.width; i += step ) {
    geometry.vertices.push( new THREE.Vector3( i, 0, 0 ) );
    geometry.vertices.push( new THREE.Vector3( i, 0, mrt.room.depth) );
  }

  var material = new THREE.LineBasicMaterial( { color: 0xaaaaaa, opacity: 0.2 } );
  var line = new THREE.Line( geometry, material );
  line.type = THREE.LinePieces;
  scene.add( line );

  var z = gen_zone_geometry();

  // plane has the same dimensions as the floor
  var margin = {
    'x': mrt.room.width / 20,
    'y': mrt.room.depth / 20,
  }
  var aspect_ratio = mrt.room.width / mrt.room.depth;
  var Nx = Math.floor(25.0 * aspect_ratio);
  var Ny = Math.floor(25.0 / aspect_ratio);
  var plane_geometry = new THREE.PlaneGeometry( mrt.room.width - margin.x, mrt.room.depth - margin.y, Nx, Ny );

  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors,
  });

  plane = new THREE.Mesh( plane_geometry, material );
  plane.rotation.x = Math.PI / 2;
  plane.position.x = mrt.room.width / 2;
  plane.position.y = mrt.room.height / 2;
  plane.position.z = mrt.room.depth / 2;
  plane.geometry.dynamic = true; // so that we can change the vertex colors
  plane.name = "visualization";
  scene.add( plane );
  plane.updateMatrixWorld();

  // Surfaces

  var Np = z.length;
  var thetax, thetaz
  for (var i = 0; i < Np; i++){ 
    var p = z[i];
    var wall = wallPanelGeometry(p.vertices);

    if (p.children.length > 0){

      wall.computeFaceNormals();
      var n0 = wall.faces[0].normal;

      var arg = Math.pow(n0.x, 2) + Math.pow(n0.z, 2)
      if (arg == 0){
        thetay = 0;
      } else {
        thetay = Math.acos( n0.z / arg );
      }
      
      arg = Math.pow(n0.y, 2) + Math.pow(n0.z, 2)
      if (arg == 0){
        thetax = 0;
      } else {
        thetax = Math.acos( n0.z / arg );
      }

      var t = new THREE.Matrix4();
      var u = new THREE.Matrix4();
      var ti = new THREE.Matrix4();
      t.makeRotationX( thetax );
      u.makeRotationY( thetay );
      t.multiply( u );
      ti.getInverse( t );

      // height translation to be applied later
      var h = new THREE.Matrix4();
      h.makeTranslation(wall.vertices[0].x, wall.vertices[0].y, wall.vertices[0].z);

      wall.applyMatrix( t );
      var wallShape = new THREE.Shape();
      wallShape.moveTo( wall.vertices[0].x, wall.vertices[0].y );

      for (var j = 1; j < wall.vertices.length; j++){
        var v = wall.vertices[j];
        wallShape.lineTo( v.x, v.y );
      }

      for (var k = 0; k < p.children.length; k++){
        var panel = wallPanelGeometry(p.children[k].vertices);
        panel.applyMatrix( t );
        var hole = new THREE.Path();
        hole.moveTo(panel.vertices[0].x, panel.vertices[0].y);
        for (var kk = (panel.vertices.length - 1); kk > 0; kk--){
          hole.lineTo(panel.vertices[kk].x, panel.vertices[kk].y);
        }
        wallShape.holes.push(hole);

        panel.applyMatrix( ti );
        var mesh = wallPanelMesh(panel);
        mesh.name = p.children[k].name;
        scene.add(mesh);
        surfaces.push(mesh);

      }
      wall = new THREE.ShapeGeometry(wallShape);
      wall.applyMatrix( ti );
      wall.applyMatrix( h );
    }

    // wall texture
    //var wall_texture = THREE.ImageUtils.loadTexture( 'img/wall1.jpg' );
    var material = new THREE.MeshPhongMaterial( { 
        color: 0xffffff, 
        //map: wall_texture, 
        //bumpMap: wall_texture, 
        reflectivity: 100, 
        transparent: true, 
        opacity: 1.0,
    } );

    material.side = THREE.DoubleSide;
    var mesh = new THREE.Mesh(wall, material);

    var uva = new THREE.Vector2(0,0);
    var uvb = new THREE.Vector2(0,1);
    var uvc = new THREE.Vector2(1,1);
    var uvd = new THREE.Vector2(1,0);
    
    mesh.geometry.faceVertexUvs[0].push([uva, uvb, uvc])
    mesh.geometry.faceVertexUvs[0].push([uva.clone(), uvc, uvd.clone()])
    
    mesh.geometry.computeFaceNormals();
    mesh.geometry.computeVertexNormals();

    mesh.name = p.name;
    scene.add(mesh);
    surfaces.push(mesh);
    
    setOpacity(params.opacity);

    // edges
    var egh = new THREE.EdgesHelper(mesh, 0x444444);
    egh.material.linewidth = 2;
    scene.add(egh);

  }
}

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.CombinedCamera( window.innerWidth / 2, window.innerHeight / 2, 70, 1, 3000, - 500, 1000 );
  camera.position.x = mrt.room.width * 2;
  camera.position.y = mrt.room.height * 2;
  camera.position.z = mrt.room.depth * 2;
  scene = new THREE.Scene();
  raycaster = new THREE.Raycaster();
  projector = new THREE.Projector();

  var dir = new THREE.Vector3( 1, 0, 0 );
  var origin = new THREE.Vector3( 1, 0, -4.5 );
  var length = 3;
  var hex = 0x000000;

  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 0.3, 0.3);
  scene.add( arrowHelper );

  var textGeo = new THREE.TextGeometry("N", {
      "size": 1, 
      "height": 0.1
  });
  var textMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
  var textMesh = new THREE.Mesh(textGeo, textMaterial); 
  textMesh.position = new THREE.Vector3( 0, 0, -5);
  textMesh.rotation.x = -Math.PI / 2;
  textMesh.rotation.z = -Math.PI / 2;
  scene.add( textMesh );

  var sunGeometry = new THREE.SphereGeometry( 1, 32, 32 );
  var sunMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000, opacity: 0.8, emissive: 0xffff00} );
  sun = new THREE.Mesh( sunGeometry, sunMaterial );
  scene.add( sun );

  // Gui
  var gui = new dat.GUI();

  var f_room = gui.addFolder('Room')
  f_room.add(mrt.room, 'width').min(2).max(100).step(1)
    .onFinishChange(function(){
      if (params.autocalculate){
        set_panel_guis();
        calculate_all();
      }
    });
  f_room.add(mrt.room, 'depth').min(2).max(100).step(1)
    .onFinishChange(function(){
      if (params.autocalculate){
        set_panel_guis();
        calculate_all();
      }
    })
  f_room.add(mrt.room, 'height').min(2).max(16).step(0.1)
    .onFinishChange(function(){
      if (params.autocalculate){
        set_panel_guis();
        calculate_all();
      }
    });

  function set_surface_property(surface_name, property, value, panel){         
    var surface = _.find(mrt.walls, function(r){ return r.name == surface_name; });
    if (panel){
      surface.subsurfaces[0][property] = value;
    } else {
      surface[property] = value;
    }
    if (params.autocalculate){
      update_shortwave_components();
      update_visualization();
    }
  }

  // Surfaces
  var f_surfaces = gui.addFolder('Surfaces');

  // Wall 1 gui /////////////////////

  var f_wall1 = f_surfaces.addFolder('Wall 1');
  f_wall1.add(params.wall1, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall1', 'temperature', params.wall1.temperature, false) });
  f_wall1.add(params.wall1, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall1', 'emissivity', params.wall1.emissivity, false) });

  var panel_wall1 = f_wall1.addFolder('Panel');
  panel_wall1.add(params.wall1.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall1.add(params.wall1.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall1', 'temperature', params.wall1.panel.temperature, true) });
  panel_wall1.add(params.wall1.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall1', 'emissivity', params.wall1.panel.emissivity, true) });

  var panel_wall1_width = panel_wall1.add(params.wall1.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall1_height = panel_wall1.add(params.wall1.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall1_xpos = panel_wall1.add(params.wall1.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall1_ypos = panel_wall1.add(params.wall1.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall1_width, panel_wall1_height, panel_wall1_xpos, panel_wall1_ypos], function(g){
    g.onFinishChange(function(){ 
      if (params.wall1.panel.active){
        calculate_all(); 
      }
    });
  });

  // Wall 2 gui /////////////////////

  var f_wall2 = f_surfaces.addFolder('Wall 2');
  f_wall2.add(params.wall2, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall2', 'temperature', params.wall2.temperature, false) });
  f_wall2.add(params.wall2, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall2', 'emissivity', params.wall2.emissivity, false) });

  var panel_wall2 = f_wall2.addFolder('Panel');
  panel_wall2.add(params.wall2.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall2.add(params.wall2.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall2', 'temperature', params.wall2.panel.temperature, true) });
  panel_wall2.add(params.wall2.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall2', 'emissivity', params.wall2.panel.emissivity, true) });

  var panel_wall2_width = panel_wall2.add(params.wall2.panel, 'width').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall2_height = panel_wall2.add(params.wall2.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall2_xpos = panel_wall2.add(params.wall2.panel, 'xposition').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall2_ypos = panel_wall2.add(params.wall2.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall2_width, panel_wall2_height, panel_wall2_xpos, panel_wall2_ypos], function(g){
    g.onFinishChange(function(){ 
      if (params.wall2.panel.active){
        calculate_all(); 
      }
    });
  });

  // Wall 3 gui /////////////////////

  var f_wall3 = f_surfaces.addFolder('Wall 3');
  f_wall3.add(params.wall3, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall3', 'temperature', params.wall3.temperature, false) });
  f_wall3.add(params.wall3, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall3', 'emissivity', params.wall3.emissivity, false) });

  var panel_wall3 = f_wall3.addFolder('Panel');
  panel_wall3.add(params.wall3.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall3.add(params.wall3.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall3', 'temperature', params.wall3.panel.temperature, true) });
  panel_wall3.add(params.wall3.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall3', 'emissivity', params.wall3.panel.emissivity, true) });

  var panel_wall3_width = panel_wall3.add(params.wall3.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall3_height = panel_wall3.add(params.wall3.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall3_xpos = panel_wall3.add(params.wall3.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_wall3_ypos = panel_wall3.add(params.wall3.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall3_width, panel_wall3_height, panel_wall3_xpos, panel_wall3_ypos], function(g){
    g.onFinishChange(function(){ 
      if (params.wall3.panel.active){
        calculate_all(); 
      }
    });
  });

  // Wall 4 gui /////////////////////

  var f_wall4 = f_surfaces.addFolder('Wall 4');
  f_wall4.add(params.wall4, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall4', 'temperature', params.wall4.temperature, false) });
  f_wall4.add(params.wall4, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall4', 'emissivity', params.wall4.emissivity, false) });

  var panel_wall4 = f_wall4.addFolder('Panel');
  panel_wall4.add(params.wall4.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_wall4.add(params.wall4.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('wall4', 'temperature', params.wall4.panel.temperature, true) });
  panel_wall4.add(params.wall4.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('wall4', 'emissivity', params.wall4.panel.emissivity, true) });

  var panel_wall4_width = panel_wall4.add(params.wall4.panel, 'width').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall4_height = panel_wall4.add(params.wall4.panel, 'height').min(0.1).max(mrt.room.height).step(0.01)
  var panel_wall4_xpos = panel_wall4.add(params.wall4.panel, 'xposition').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_wall4_ypos = panel_wall4.add(params.wall4.panel, 'yposition').min(0.1).max(mrt.room.height).step(0.01)
  _.each([panel_wall4_width, panel_wall4_height, panel_wall4_xpos, panel_wall4_ypos], function(g){
    g.onFinishChange(function(){ 
      if (params.wall4.panel.active){
        calculate_all(); 
      }
    });
  });

  // Ceiling gui /////////////////////

  var f_ceiling = f_surfaces.addFolder('Ceiling')
  f_ceiling.add(params.ceiling, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('ceiling', 'temperature', params.ceiling.temperature, false) });
  f_ceiling.add(params.ceiling, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('ceiling', 'emissivity', params.ceiling.emissivity, false) });

  var panel_ceiling = f_ceiling.addFolder('Panel');
  panel_ceiling.add(params.ceiling.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_ceiling.add(params.ceiling.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('ceiling', 'temperature', params.ceiling.panel.temperature, true) });
  panel_ceiling.add(params.ceiling.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('ceiling', 'emissivity', params.ceiling.panel.emissivity, true) });

  var panel_ceiling_width = panel_ceiling.add(params.ceiling.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_ceiling_height = panel_ceiling.add(params.ceiling.panel, 'height').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_ceiling_xpos = panel_ceiling.add(params.ceiling.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_ceiling_ypos = panel_ceiling.add(params.ceiling.panel, 'yposition').min(0.1).max(mrt.room.depth).step(0.01)
    _.each([panel_ceiling_width, panel_ceiling_height, panel_ceiling_xpos, panel_ceiling_ypos], function(g){
    g.onFinishChange(function(){ 
      if (params.ceiling.panel.active){
        calculate_all(); 
      }
    });
  });

  // Floor gui /////////////////////

  var f_floor = f_surfaces.addFolder('Floor');
  f_floor.add(params.floor, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('floor', 'temperature', params.floor.temperature, false) });
  f_floor.add(params.floor, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('floor', 'emissivity', params.floor.emissivity, false) });

  var panel_floor = f_floor.addFolder('Panel');
  panel_floor.add(params.floor.panel, 'active')
    .onFinishChange(function(){ calculate_all(); });
  panel_floor.add(params.floor.panel, 'temperature').min(0).max(100).step(0.1)
    .onFinishChange(function(){ set_surface_property('floor', 'temperature', params.floor.panel.temperature, true) });
  panel_floor.add(params.floor.panel, 'emissivity').min(0).max(1).step(0.01)
    .onFinishChange(function(){ set_surface_property('floor', 'emissivity', params.floor.panel.emissivity, true) });

  var panel_floor_width = panel_floor.add(params.floor.panel, 'width').min(0.1).max(mrt.room.width).step(0.01)
  var panel_floor_height = panel_floor.add(params.floor.panel, 'height').min(0.1).max(mrt.room.depth).step(0.01)
  var panel_floor_xpos = panel_floor.add(params.floor.panel, 'xposition').min(0.1).max(mrt.room.width).step(0.01)
  var panel_floor_ypos = panel_floor.add(params.floor.panel, 'yposition').min(0.1).max(mrt.room.depth).step(0.01)
  _.each([panel_floor_width, panel_floor_height, panel_floor_xpos, panel_floor_ypos], function(g){
    g.onFinishChange(function(){ 
      if (params.floor.panel.active){
        calculate_all(); 
      }
    });
  });

  // Occupant gui /////////////////////

  var f_occupant = gui.addFolder('Occupant')

  f_occupant.add(mrt.occupant, 'posture', [ 'seated', 'standing' ] )
    .onFinishChange(function(){
      calculate_all();
    })

  f_occupant.add(params, 'azimuth').min(0.0).max(360).step(1)
    .onFinishChange(function(){
      mrt.occupant.azimuth = Math.PI * params.azimuth / 180;
      calculate_all();
    })

  // Etc ... /////////////////////

  gui.add(params, 'display', [
          'MRT',
          'Longwave MRT', 
          'Shortwave dMRT',
          'Direct shortwave', 
          'Diffuse shortwave', 
          'Reflected shortwave', 
          'PMV'
  ]).onFinishChange(function(){ do_fast_stuff(); });
  gui.add(params, 'calculate now');
  gui.add(params, 'autocalculate');

  // SolarCal 

  solarcal = {
      'alt': 45, 
      'az': 0, 
      'fbes': 0.5, 
      'tsol': 0.8, 
      'Idir': 700,
      'tsol': 0.8,
      'asa': 0.7,
      'Rfloor': 0.5,
      'window_surface': 'wall1'
  }
  var solarcal_f = gui.addFolder('SolarCal');
  solarcal_f.add(solarcal, 'window_surface', ['wall1', 'wall2', 'wall3', 'wall4', 'ceiling'])
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'alt').min(0).max(90).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'az').min(0).max(360).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'fbes').min(0).max(1).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'tsol').min(0).max(1).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'asa').min(0).max(1).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  solarcal_f.add(solarcal, 'Rfloor').min(0).max(1).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });

  // Comfort
  
  comfort = {
      'ta': 25,
      'vel': 0.15,
      'rh': 50,
      'met': 1.1,
      'clo': 0.5
  }
  var f_comfort = gui.addFolder('Thermal Comfort')
  f_comfort.add(comfort, 'ta').min(0).max(50).step(0.1)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'rh').min(0).max(100).step(1)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'vel').min(0).max(4).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'met').min(0).max(4).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });
  f_comfort.add(comfort, 'clo').min(0).max(4).step(0.01)
    .onFinishChange(function(){ do_fast_stuff(); });

  function set_panel_guis(){
    panel_wall1_width.max(mrt.room.width);
    panel_wall1_height.max(mrt.room.height);
    panel_wall1_xpos.max(mrt.room.width);
    panel_wall1_ypos.max(mrt.room.height);

    panel_wall2_width.max(mrt.room.depth);
    panel_wall2_height.max(mrt.room.height);
    panel_wall2_xpos.max(mrt.room.depth);
    panel_wall2_ypos.max(mrt.room.height);

    panel_wall3_width.max(mrt.room.width);
    panel_wall3_height.max(mrt.room.height);
    panel_wall3_xpos.max(mrt.room.width);
    panel_wall3_ypos.max(mrt.room.height);

    panel_wall4_width.max(mrt.room.depth);
    panel_wall4_height.max(mrt.room.height);
    panel_wall4_xpos.max(mrt.room.depth);
    panel_wall4_ypos.max(mrt.room.height);

    panel_ceiling_width.max(mrt.room.width);
    panel_ceiling_height.max(mrt.room.depth);
    panel_ceiling_xpos.max(mrt.room.width);
    panel_ceiling_ypos.max(mrt.room.depth);

    panel_floor_width.max(mrt.room.width);
    panel_floor_height.max(mrt.room.depth);
    panel_floor_xpos.max(mrt.room.width);
    panel_floor_ypos.max(mrt.room.depth);
  };

  // Lights
  var ambientLight = new THREE.AmbientLight( 0x999999 );
  scene.add( ambientLight );

  directionalLight = new THREE.DirectionalLight( 0x808080, 1.0 );
  directionalLight.position.set( 0, 1, 0 );
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer( { antialiasing: true } );
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  container.appendChild( renderer.domElement );
  
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  
  function onWindowResize(){
    camera.setSize( window.innerWidth, window.innerHeight );
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  set_wall_properties();
  render_zone();
  update_view_factors();
  update_shortwave_components();
  update_visualization();
}

function calculate_all(){
  remove_zone();
  set_wall_properties();
  render_zone();

  // a little hack so that the function returns
  setTimeout(function(){ 
    update_view_factors();
    update_shortwave_components();
    update_visualization();
  }, 1);

}

var do_fast_stuff = function(){
  update_shortwave_components();
  update_visualization();
};

function setOpacity(opacity){
  for (var i = 0; i < scene.children.length; i++){
    var ch = scene.children[i];
    if (ch.hasOwnProperty('material')){
      ch.material.opacity = opacity / 100;
    }
  }
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
  requestAnimationFrame( animate );
  render();
  stats.update();
}

function invert_color(color) {
  var t = mrt_min + color.r * (mrt_max - mrt_min);
  return t;
}

function render() {
  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );
  raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
  var intersects = raycaster.intersectObject( plane, true );
  if ( intersects.length > 0 ) {
    // quick method for calculating the mrt
    // var t = invert_color(intersects[0].face.vertexColors[0]);

    mrt.occupant.position.x = intersects[0].point.x;
    mrt.occupant.position.y = intersects[0].point.z;
    var myvfs = mrt.view_factors();
    var t = mrt.calc(myvfs);

    document.getElementById('occupant-position').innerHTML = "Occupant (x, y): (" 
      + intersects[0].point.x.toFixed(1) + ", " + intersects[0].point.z.toFixed(1) + ")";
    document.getElementById('cursor-temperature').innerHTML = "MRT: " + t.toFixed(1);
  } else {
    document.getElementById('cursor-temperature').innerHTML = "";
    document.getElementById('occupant-position').innerHTML = "";
  }
  directionalLight.position.copy( camera.position );
  directionalLight.position.normalize();
  renderer.render( scene, camera );
  controls.update();
}

function update_view_factors(){

  view_factors = _.map(plane.geometry.vertices, function(v){ 
    var my_vector = new THREE.Vector3();
    my_vector.copy(v);
    my_vector.applyMatrix4( plane.matrixWorld );
    mrt.occupant.position.x = my_vector.x;
    mrt.occupant.position.y = my_vector.z;
    var vfs = mrt.view_factors();
    var vfsum = 0;
    for (var i = 0; i < vfs.length; i++){
      vfsum += vfs[i].view_factor;
    }
    norm_factor = 1.0 / vfsum;
    for (var i = 0; i < vfs.length; i++){
      vfs[i].view_factor *= norm_factor;
    }
    return vfs;
  });

} 

function update_shortwave_components() {

  var window_name = solarcal.window_surface + 'panel1';
  var window_object = _.find(scene.children, function(o){
    return o.name == window_name;
  }); 

  var r = 1.5 * _.max(mrt.room); 
  var alt = solarcal.alt;
  var az = solarcal.az;

  var floor = _.find(scene.children, function(c){
    return c.name == 'floor';
  });
  var skydome_center = new THREE.Vector3(0, 0, 0);
  for (var i = 0; i < floor.geometry.vertices.length; i++){
    var v = floor.geometry.vertices[i];
    skydome_center.add(v);
  }
  skydome_center.divideScalar(4);

  alt_rad = Math.PI / 2 - Math.PI * alt / 180;
  az_rad = Math.PI * az / 180;

  sun.position.x = skydome_center.x + r * Math.sin(alt_rad) * Math.cos(az_rad);
  sun.position.y = skydome_center.y + r * Math.cos(alt_rad);
  sun.position.z = skydome_center.z + r * Math.sin(alt_rad) * Math.sin(az_rad);

  if (window_object) {
    ERF_vertex_values = _.map(plane.geometry.vertices, function(v, i){
      // Check direct exposure
      var my_vector = new THREE.Vector3();
      my_vector.copy(v);
      my_vector.applyMatrix4( plane.matrixWorld );

      var sun_position = new THREE.Vector3();
      sun_position.copy(sun.position);
      sun_position.normalize();

      raycaster.set(my_vector, sun_position);
      var intersects = raycaster.intersectObject( window_object );
      if (intersects.length == 0){
        var direct = false;
        //scene.add(new THREE.ArrowHelper( sun_position, my_vector, 1, 0xff0000))
      } else {
        var direct = true;
        //scene.add(new THREE.ArrowHelper( sun_position, my_vector, 1, 0x00ff00))
      }

      var my_view_factor = _.find(view_factors[i], function(o){
         return o.name == solarcal.window_surface + 'panel1';
      }).view_factor;
      var svvf = my_view_factor;
      var my_erf = ERF(alt, az, mrt.occupant.posture, 
        solarcal.Idir, solarcal.tsol, svvf, 
        solarcal.fbes, solarcal.asa, solarcal.Rfloor, direct)
      return my_erf;
    });
  } else {
    // if no window object, all components are zero
    ERF_vertex_values = _.map(plane.geometry.vertices, function(){ 
      return {'E_direct': 0, 'E_diff': 0, 'E_refl': 0, 'dMRT': 0, 'ERF': 0};
    });
      
  }

}

function update_visualization(){
  var vertex_values; 

  if (params.display == 'MRT') {
    var vertex_values = _.map(view_factors, function(vfs, i){
      return mrt.calc(vfs) + ERF_vertex_values[i].dMRT;
    });
  } else if (params.display == 'Longwave MRT'){
    vertex_values = _.map(view_factors, function(vfs){ 
      return mrt.calc(vfs);
    });
  } else if (params.display == 'Direct shortwave') {
    vertex_values = _.map(ERF_vertex_values, function(v){
      return v.E_direct;
    });
  } else if (params.display == 'Diffuse shortwave') {
    vertex_values = _.map(ERF_vertex_values, function(v){
      return v.E_diff;
    });
  } else if (params.display == 'Reflected shortwave') {
    vertex_values = _.map(ERF_vertex_values, function(v){
      return v.E_refl;
    });
  } else if (params.display == 'Shortwave dMRT') {
    vertex_values = _.map(ERF_vertex_values, function(v){
      return v.dMRT;
    });
  } else if (params.display == 'PMV') {
    var mrt_values = _.map(view_factors, function(vfs){ 
      return mrt.calc(vfs);
    });
    vertex_values = _.map(mrt_values, function(mrt_val) {
      var my_pmv = comf.pmvElevatedAirspeed(comfort.ta, mrt_val, 
        comfort.vel, comfort.rh, comfort.met, comfort.clo, 0);
      return my_pmv.pmv;
    });
    
  }

  scale_min = _.min(vertex_values);
  scale_max = _.max(vertex_values);

  document.getElementById("scale-maximum").innerHTML = scale_max.toFixed(1);
  document.getElementById('scale-minimum').innerHTML = scale_min.toFixed(1);
  var vertex_colors = _.map(vertex_values, function(v){
    var value_range = scale_max - scale_min;
    if (value_range == 0){
      return new THREE.Color(0, 0, 1);
    } else {
      var r = (v - scale_min) / (scale_max - scale_min);
      return new THREE.Color(r, 0, 1 - r);
    }
  });

  var faceIndices = [ 'a', 'b', 'c'];
  for (var i = 0; i < plane.geometry.faces.length; i++){
    var f = plane.geometry.faces[i];
    f.vertexColors = [];
    for (var j = 0; j < 3; j++){
      var idx = f[ faceIndices[ j ] ];
      f.vertexColors.push( vertex_colors[ idx ] );
    }
  }
  plane.geometry.colorsNeedUpdate = true;
}