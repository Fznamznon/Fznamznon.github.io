/**
 * Created by Мария on 09.08.2016.
 */



var lvAVG = [-0.06723282854999998, 0.06897249222500001, 0.055131804300000004];
var rvAVG = [-0.25731264130434783, 0.04981530221304347, 0.20386723265217388];
var avg = getAvg([lvAVG, rvAVG]);





var Models = [];
function Model(arrays, name, color) {
    this.controlMesh =
    {
        points: [],
        cells: [],
        triangles: [],
        BC: []

    }

    this.controlMesh.points = arrays.points;
    this.controlMesh.cells = arrays.cells;
    this.basisMesh = null;

    this.currentMesh =
    {
        points: [],
        cells: [],
        triangles: [],
        BC: []

    }

    this.currentMesh.points = arrays.points.slice();
    this.currentMesh.cells = arrays.cells.slice();



    this.scene = null;
    this.movable = false;
    this.startBasis = [];
    this.endBasis = [];
    this.basis = [];
    this.wireframeMode = 0;
    this.visible = true;
    this.default_color = color;
    this.name = name;
    this.current_color = color;
    //this.normal_color = color;
    this.planes = [];
    this.indices = [];

    this.avgh = [0.0, 0.0, 0.0];

    this.mesh = null;
    this.wireframe = null;
    Models.push(this);

    this.geo = null;
    this.contour = null;

    this.addToScene = function (scene) {
        this.scene = scene;
    }

    this.getBasisFromFile = function(startName, endName, additionalStart, additionalEnd, pointholder) 
    {
        this.movable = true;
        this.basis = loader.load(startName, 2);
        this.endBasis = loader.load(endName, 2);
        for (var i = 0; i < this.basis.length; ++i) 
        {
            var b = this.basis[i];
            b.push(pointholder.slice());
            var vec = new Array(4);
            for (var j = 0; j < 4; ++j)
            {
                vec[j] = b[j].slice();
            }
            this.startBasis.push(vec);
            b = this.endBasis[i];
            b.push(pointholder.slice());
        }

        if (additionalStart != null) 
        {
            this.basis.push(loader.load(additionalStart, 2));
            this.endBasis.push(loader.load(additionalEnd, 2));
            this.startBasis.push(loader.load(additionalStart, 2));

        }

    }

    this.addBasis = function (b1, b2, b3, b4) {
        this.movable = true;
        var vec = [];
        vec.push(b1);
        vec.push(b2);
        vec.push(b3);
        vec.push(b4);
        this.startBasis.push(vec);

        var vec2 = new Array(4);
        for (var i = 0; i < 4; ++i) {
            vec2[i] = vec[i].slice();
            //this.endBasis[i] = basis[i].slice();
        }
        this.basis.push(vec2);

    }

    this.initEndBasis = function (point, r1, r2, r3, r4, i) {

        var vec = new Array(4);

        vec[0] = offsetPoint(this.startBasis[i][0], point, r1);
        vec[1] = offsetPoint(this.startBasis[i][1], point, r2);
        vec[2] = offsetPoint(this.startBasis[i][2], point, r3);
        vec[3] = offsetPoint(this.startBasis[i][3], point, r4);

        this.endBasis.push(vec);
    }

    this.getColorArray = function (color) {
        var colors = new Uint8Array(this.currentMesh.points.length);
        for (var i = 0; i < colors.length; i += 3) {
            colors[i] = color.r * 255;
            colors[i + 1] = color.g * 255;
            colors[i + 2] = color.b * 255;
        }
        return colors;
    }

    this.setColor = function (color) {
        var colors = this.getColorArray(color);
        this.mesh.geometry.attributes.color.array = colors;
        this.mesh.geometry.attributes.color.needsUpdate = true;
    }

    this.refreshMesh = function (scene, material) {

        var geometry = new THREE.BufferGeometry();

        var vertices = new Float32Array(this.currentMesh.points);
        var indices = new Uint32Array(this.currentMesh.triangles);
        var temp_color = new THREE.Color(this.current_color);
        var colors = this.getColorArray(temp_color);
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3, true));
        geometry.computeVertexNormals();

        geometry.attributes.color.needsUpdate = true;
        this.geo = new THREE.Geometry().fromBufferGeometry(geometry);

        this.mesh = new THREE.Mesh(geometry, material);
        //this.mesh.doubleSided = true;


    }

    this.hide = function () {
        if (this.mesh != null)
            scene.remove(this.mesh);
        if (this.wireframe != null)
            scene.remove(this.wireframe);
    }

    this.refreshDisplay = function () {

        if (this.movable) {
            this.drawBasis();
        }
        if (this.mesh != null) {
            scene.remove(this.mesh);
            //this.mesh.dispose();
        }
        if (this.wireframe != null) {
            scene.remove(this.wireframe);
            //this.mesh.dispose();
        }
        this.mesh = null;
        this.wireframe = null;
        var material;

        switch (this.wireframeMode) {
            case 0:
                material = new THREE.MeshPhongMaterial({
                    vertexColors: THREE.VertexColors,
                    specular: 0x666666, shininess: 20
                });
                material.side = THREE.DoubleSide;


                this.refreshMesh(scene, material);
                break;
            case 1:

                material = new THREE.MeshPhongMaterial({
                    vertexColors: THREE.VertexColors,
                    specular: 0x666666, shininess: 40
                });
                material.side = THREE.DoubleSide;

                this.refreshMesh(scene, material);
                this.wireframe = new THREE.WireframeHelper(this.mesh, 0x0000ff);
                scene.add(this.wireframe);
                break;

            case 2:
                material = new THREE.MeshBasicMaterial({
                    vertexColors: THREE.VertexColors,
                    wireframe: true
                });

                material.side = THREE.DoubleSide;
                this.refreshMesh(scene, material);
                break;

        }
        scene.add(this.mesh);

    }

    this.convertToTriangles = function (Mesh) {
        var cells = Mesh.cells;
        Mesh.triangles = [];

        for (var i = 0; i < cells.length; ++i) {
            if (cells[i].length == 3) {
                Mesh.triangles.push(cells[i][0]);
                Mesh.triangles.push(cells[i][1]);
                Mesh.triangles.push(cells[i][2]);

            }
            if (cells[i].length == 4) {
                Mesh.triangles.push(cells[i][0]);
                Mesh.triangles.push(cells[i][1]);
                Mesh.triangles.push(cells[i][2]);

                Mesh.triangles.push(cells[i][0]);
                Mesh.triangles.push(cells[i][2]);
                Mesh.triangles.push(cells[i][3]);

            }
        }
    }

    this.getBc = function (x, y, z, bs) {
        var coords = [];
        var b1 = bs[0];
        var b2 = bs[1];
        var b3 = bs[2];
        var b4 = bs[3];
        var m1, m2, m3, m4;
        var maindet = (b2[0] - b1[0]) * (b3[1] - b1[1]) * (b4[2] - b1[2]) +
            (b2[1] - b1[1]) * (b3[2] - b1[2]) * (b4[0] - b1[0]) +
            (b3[0] - b1[0]) * (b4[1] - b1[1]) * (b2[2] - b1[2]) -
            (b4[0] - b1[0]) * (b3[1] - b1[1]) * (b2[2] - b1[2]) -
            (b3[2] - b1[2]) * (b4[1] - b1[1]) * (b2[0] - b1[0]) -
            (b3[0] - b1[0]) * (b2[1] - b1[1]) * (b4[2] - b1[2]);
        var det = (x - b1[0]) * (b3[1] - b1[1]) * (b4[2] - b1[2]) +
            (y - b1[1]) * (b3[2] - b1[2]) * (b4[0] - b1[0]) +
            (b3[0] - b1[0]) * (b4[1] - b1[1]) * (z - b1[2]) -
            (b4[0] - b1[0]) * (b3[1] - b1[1]) * (z - b1[2]) -
            (b3[2] - b1[2]) * (b4[1] - b1[1]) * (x - b1[0]) -
            (b3[0] - b1[0]) * (y - b1[1]) * (b4[2] - b1[2]);
        m2 = det / maindet;
        det = (b2[0] - b1[0]) * (y - b1[1]) * (b4[2] - b1[2]) +
            (b2[1] - b1[1]) * (z - b1[2]) * (b4[0] - b1[0]) +
            (x - b1[0]) * (b4[1] - b1[1]) * (b2[2] - b1[2]) -
            (b4[0] - b1[0]) * (y - b1[1]) * (b2[2] - b1[2]) -
            (z - b1[2]) * (b4[1] - b1[1]) * (b2[0] - b1[0]) -
            (x - b1[0]) * (b2[1] - b1[1]) * (b4[2] - b1[2]);

        m3 = det / maindet;
        det = (b2[0] - b1[0]) * (b3[1] - b1[1]) * (z - b1[2]) +
            (b2[1] - b1[1]) * (b3[2] - b1[2]) * (x - b1[0]) +
            (b3[0] - b1[0]) * (y - b1[1]) * (b2[2] - b1[2]) -
            (x - b1[0]) * (b3[1] - b1[1]) * (b2[2] - b1[2]) -
            (b3[2] - b1[2]) * (y - b1[1]) * (b2[0] - b1[0]) -
            (b3[0] - b1[0]) * (b2[1] - b1[1]) * (z - b1[2]);

        m4 = det / maindet;
        m1 = 1 - m2 - m3 - m4;
        coords.push(m1);
        coords.push(m2);
        coords.push(m3);
        coords.push(m4);
        return coords;
    }

    this.rtd = function (m1, m2, m3, m4, bs) {
        var coords = [];
        var b1 = bs[0];
        var b2 = bs[1];
        var b3 = bs[2];
        var b4 = bs[3];
        coords.push((m1 * b1[0] + m2 * b2[0] + m3 * b3[0] + m4 * b4[0]) / (m1 + m2 + m3 + m4));
        coords.push((m1 * b1[1] + m2 * b2[1] + m3 * b3[1] + m4 * b4[1]) / (m1 + m2 + m3 + m4));
        coords.push((m1 * b1[2] + m2 * b2[2] + m3 * b3[2] + m4 * b4[2]) / (m1 + m2 + m3 + m4));
        return coords;
    }

    this.setBC = function (Mesh) {
        Mesh.BC = new Array(Mesh.points.length / 3 * 4);

        this.indices = new Array(this.startBasis.length);
        for (i = 0; i < this.indices.length; ++i) {
            this.indices[i] = []
        }
       
        for (i = 0; i < Mesh.points.length; i += 3) {
            for (j = 0; j < this.startBasis.length; ++j) {
                var x = Mesh.points[i];
                var y = Mesh.points[i + 1];
                var z = Mesh.points[i + 2];
                var bc = this.getBc(x, y, z, this.startBasis[j]);
                var ind = i / 3;

                if (bc[0] > 0 && bc[1] > 0 && bc[2] > 0 && bc[3] > 0) 
                {
                    this.indices[j].push(ind);
                    Mesh.BC[ind * 4] = bc[0];
                    Mesh.BC[ind * 4 + 1] = bc[1];
                    Mesh.BC[ind * 4 + 2] = bc[2];
                    Mesh.BC[ind * 4 + 3] = bc[3];
                    m = true;
                }
                else 
                {
                    //addDot(new THREE.Vector3(x, y ,z), "#ffffff", this.scene);
                    console.log("vtx" + ind.toString());

                }
            }
        }

    }



    this.changeBasis = function () {

        for (i = 0; i < this.indices.length; ++i) {
            for (j = 0; j < this.indices[i].length; ++j) {
                var ind = this.indices[i][j];

                var a = this.currentMesh.BC[ind * 4];
                var b = this.currentMesh.BC[ind * 4 + 1];
                var c = this.currentMesh.BC[ind * 4 + 2];
                var d = this.currentMesh.BC[ind * 4 + 3];

                var coords = this.rtd(a, b, c, d, this.basis[i]);


                this.currentMesh.points[ind * 3] = coords[0];
                this.currentMesh.points[ind * 3 + 1] = coords[1];
                this.currentMesh.points[ind * 3 + 2] = coords[2];


            }

        }

    }

    this.returnToControlMesh = function () {
        this.currentMesh.points = [];
        this.currentMesh.triangles = [];
        this.currentMesh.BC = [];
        for (var i = 0; i < this.controlMesh.points.length; ++i) {
            this.currentMesh.points.push(this.controlMesh.points[i]);
        }
        for (var i = 0; i < this.controlMesh.triangles.length; ++i) {
            this.currentMesh.triangles.push(this.controlMesh.triangles[i]);
        }
        //for (var i = 0; i < this.controlMesh.BC.length; ++i) {
        //  this.currentMesh.BC.push(this.controlMesh.BC[i]);
        //
        if (this.movable)
            this.setBC(this.currentMesh);
    }

this.setAvgh = function () {
        var positions = this.currentMesh.points;

        originalPoints = [];

        faces = [];

        edges = [];
        avghole = [];

        var cells = this.currentMesh.cells;
        for (var iCell = 0; iCell < cells.length; ++iCell) {

            var cellPositions = cells[iCell];
            var facePoints = [];

            // initialize:
            faces[iCell] = {};


            // go through all the points of the face.
            for (var j = 0; j < cellPositions.length; ++j) {

                var positionIndex = cellPositions[j];

                var pointObject;

                if (typeof originalPoints[positionIndex] === 'undefined') {

                    var vec = [];
                    vec.push(positions[positionIndex * 3]);
                    vec.push(positions[positionIndex * 3 + 1]);
                    vec.push(positions[positionIndex * 3 + 2]);
                    pointObject = {
                        point: vec,
                        faces: [],
                        edges: new Set()

                    };

                    originalPoints[positionIndex] = pointObject;
                } else {
                    pointObject = originalPoints[positionIndex];
                }

                pointObject.faces.push(faces[iCell]);

                facePoints.push(pointObject);
            }

            faces[iCell].points = facePoints;

            var avg = [0, 0, 0];


            var faceEdges = [];

            for (var iEdge = 0; iEdge < cellPositions.length; ++iEdge) {

                var edge;

                if (cellPositions.length == 3) { // for triangles
                    if (iEdge == 0) {
                        edge = [cellPositions[0], cellPositions[1]];
                    } else if (iEdge == 1) {
                        edge = [cellPositions[1], cellPositions[2]];
                    } else if (iEdge == 2) {
                        edge = [cellPositions[2], cellPositions[0]];
                    }
                } else { // for quads.
                    if (iEdge == 0) {
                        edge = [cellPositions[0], cellPositions[1]];
                    } else if (iEdge == 1) {
                        edge = [cellPositions[1], cellPositions[2]];
                    } else if (iEdge == 2) {
                        edge = [cellPositions[2], cellPositions[3]];
                    } else if (iEdge == 3) {
                        edge = [cellPositions[3], cellPositions[0]];
                    }
                }

                edge = _sort(edge);

                var edgeObject;
                if (typeof edges[edge] === 'undefined') {

                    edgeObject = {
                        points: [originalPoints[edge[0]], originalPoints[edge[1]]],
                        faces: []

                    };

                    edges[edge] = edgeObject;
                } else {
                    edgeObject = edges[edge];
                }

                edgeObject.faces.push(faces[iCell]);

                edgeObject.points[0].edges.add(edgeObject);
                edgeObject.points[1].edges.add(edgeObject);


                faceEdges.push(edgeObject);
            }

            faces[iCell].edges = faceEdges;
        }
        avghole = [0, 0, 0];
        var hc = 0.0;

        for (var i = 0; i < positions.length / 3; ++i) {

            var point = originalPoints[i];
            var n = point.faces.length;


            if (n != point.edges.size) {

                addvec(avghole, point.point);
                hc++;
            }
        }

        multvec(avghole, 1.0 / hc);
        this.avgh = avghole;
    }

    this.updateSubdiv = function (numSubdivisions) {

        if (numSubdivisions == 0)
            this.returnToControlMesh();
        else {
            var obj = catmullClark(this.controlMesh.points, this.controlMesh.cells, numSubdivisions);
            this.currentMesh.points = obj.points;
            this.currentMesh.cells = obj.cells;
            this.convertToTriangles(this.currentMesh);
            if (this.movable) {
                
                this.setBC(this.currentMesh);
                this.changeBasis();
                this.refreshPoints();

            }
            this.avgh = obj.avgh;
        }

    }
    this.searchMinY = function () {
        var min = 100500;
        var index = -1;
        for (var i = 0; i < this.currentMesh.points.length; i += 3) {
            if (this.currentMesh.points[i + 1] < min) {
                min = this.currentMesh.points[i + 1];
                index = i;
            }
        }
        return index;
    }
    

    this.systole = function (start, stop, cur) {
        for (var j = 0; j < this.basis.length; ++j) {
            for (var i = 0; i < 4; ++i) {
                var hx = (this.endBasis[j][i][0] - this.startBasis[j][i][0]) / (stop - start);
                var hy = (this.endBasis[j][i][1] - this.startBasis[j][i][1]) / (stop - start);
                var hz = (this.endBasis[j][i][2] - this.startBasis[j][i][2]) / (stop - start);

                this.basis[j][i][0] = this.startBasis[j][i][0] + (cur - start) * hx;
                this.basis[j][i][1] = this.startBasis[j][i][1] + (cur - start) * hy;
                this.basis[j][i][2] = this.startBasis[j][i][2] + (cur - start) * hz;
            }
        }
        this.changeBasis();

    }

    this.diastole = function (start, stop, cur) {

        for (var j = 0; j < this.basis.length; ++j) {
            for (var i = 0; i < 4; ++i) {
                var hx = (this.endBasis[j][i][0] - this.startBasis[j][i][0]) / (stop - start);
                var hy = (this.endBasis[j][i][1] - this.startBasis[j][i][1]) / (stop - start);
                var hz = (this.endBasis[j][i][2] - this.startBasis[j][i][2]) / (stop - start);

                this.basis[j][i][0] = this.endBasis[j][i][0] - (cur - start) * hx;
                this.basis[j][i][1] = this.endBasis[j][i][1] - (cur - start) * hy;
                this.basis[j][i][2] = this.endBasis[j][i][2] - (cur - start) * hz;
            }
        }
        this.changeBasis();

    }

    this.addPlane = function (t1, t2, t3) {

        var p1 = new THREE.Vector3(t1[0], t1[1], t1[2]);
        var p2 = new THREE.Vector3(t2[0], t2[1], t2[2]);
        var p3 = new THREE.Vector3(t3[0], t3[1], t3[2]);

        var p4 = new THREE.Vector3().subVectors(p3, p2);
        var p5 = new THREE.Vector3().subVectors(p3, p1);
        var norm = new THREE.Vector3().crossVectors(p5, p4);
        norm.normalize();
        var A = norm.x;
        var B = norm.y;
        var C = norm.z;

        var D = -(A * p1.x + B * p1.y + C * p1.z);

        plane = [A, B, C, D];
        this.planes.push(plane);
        /*
         var dir = new THREE.Vector3().copy(norm);

         dir.normalize();

         var origin = new THREE.Vector3().copy(p1);
         var length = 0.5;
         var hex = 0xffff00;

         var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
         scene.add( arrowHelper );*/
    }


    this.refreshPoints = function () {
        this.mesh.geometry.removeAttribute('position');

        var vertices = new Float32Array(this.currentMesh.points);
        this.mesh.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        this.mesh.geometry.computeVertexNormals();
        this.mesh.geometry.attributes.position.needsUpdate = true;

        var bvertices = new Float32Array(this.basis.length * 3 * 3);            
        var index = 0;
        for (var i = 0; i < this.basis.length; ++i) 
        {
            for (var j = 0; j < 3; ++j)
            {
                for (var q = 0; q < 3; ++q) 
                {
                    bvertices[index] = this.basis[i][j][q];            
                    index++;
                }
            }
        }
        this.basisMesh.geometry.addAttribute('position', new THREE.BufferAttribute(bvertices, 3));
        this.basisMesh.geometry.computeVertexNormals();
        this.basisMesh.geometry.attributes.position.needsUpdate = true;

    }


    this.convertToTriangles(this.controlMesh);
    this.convertToTriangles(this.currentMesh);

    this.drawBasis = function() 
    {
        if (this.basisMesh != null) {
            scene.remove(this.basisMesh);
        }
        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array(this.basis.length * 3 * 3);            
        var index = 0;
        for (var i = 0; i < this.basis.length; ++i) 
        {
            for (var j = 0; j < 3; ++j)
            {
                for (var q = 0; q < 3; ++q) 
                {
                    vertices[index] = this.basis[i][j][q];            
                    index++;
                }
            }
        }
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        var material = new THREE.MeshBasicMaterial({
            color: "#ffff00",
            wireframe: true
        });

        material.side = THREE.DoubleSide;

        this.basisMesh = new THREE.Mesh(geometry, material);

        scene.add(this.basisMesh);
    }
}


function Heart_cycle(data, cur) {

    for (var j = 0; j < data.length; ++j) {
        if (cur <= data[j][1] && cur >= data[j][0]) {
            for (var i = 0; i < Models.length; ++i) {
                if (Models[i].movable) {
                    if (data[j][2] == 1) {
                        Models[i].systole(data[j][0], data[j][1], cur);
                    }
                    else if (data[j][2] == -1) {
                        Models[i].diastole(data[j][0], data[j][1], cur);
                    }

                    Models[i].refreshPoints(scene);
                }
            }
            break;
        }
    }

}

function addMeshesControl() {
    //lv.getBasisFromFile("ico_lv.obj");
    //mitral.getBasisFromFile("ico_lv.obj");
    //rv.getBasisFromFile("ico_rv.obj");
    //tricuspid.getBasisFromFile("ico_rv.obj");
    heart.getBasisFromFile("icosahedron.obj", "ico_h.obj", null, null, avg);
    lv.getBasisFromFile("2_s.obj", "lv_f.obj", null, null, lvAVG);
    mitral.getBasisFromFile("2_s.obj", "3_f.obj",
        null, null, lvAVG);
	rv.getBasisFromFile("rv_start_new.obj", "5_f.obj", null, null, rvAVG);
	tricuspid.getBasisFromFile("rv_start_new.obj", "tricusp_finish_new.obj",
        null, null, rvAVG);

}


function initMoving() {
    addMeshesControl();
    for (var i = 0; i < Models.length; ++i) {
        if (Models[i].basis.length != 0) {
            Models[i].setBC(Models[i].currentMesh);
            Models[i].setBC(Models[i].controlMesh);
        }
    }

}

var arrays;
arrays = loader.load("heart_arteries.txt", 1);
var heart_arteries = new Model(arrays, "Heart_Arteries", "#c70000");

arrays = loader.load("heart_veins.txt", 1);
var heart_veins = new Model(arrays, "Heart_Veins", "#335e92");

arrays = loader.load("valve2.txt", 1);
var mitral = new Model(arrays, "Mitral_Valve", "#ffe6e6");

arrays = loader.load("Aortha.txt", 1);
var aortha = new Model(arrays, "Aortha", "#c70000");

arrays = loader.load("tricuspid_valve.txt", 1);
var tricuspid = new Model(arrays, "Tricuspid_Valve", "#ffe6e6");

arrays = loader.load("Pulmonary.txt", 1);
var pulmonary = new Model(arrays, "Pulmonary_Artery", "#335e92");

arrays = loader.load("Left_atrium2.txt", 1);
var la = new Model(arrays, "Left_Atrium", "#c70000");

arrays = loader.load("Right_atrium2.txt", 1);
var ra = new Model(arrays, "Right_Atrium", "#335e92");

arrays = loader.load("Left_ventricle.txt", 1);
var lv = new Model(arrays, "lv", "#c70000");

arrays = loader.load("Right_ventricle.txt", 1);
var rv = new Model(arrays, "rv", "#335e92");

arrays = loader.load("heart.txt", 1);
var heart = new Model(arrays, "Heart", "#bf4040");

initMoving();
