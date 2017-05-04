/**
 * Created by Мария on 09.08.2016.
 */

function offsetPoint(p1, p2, r) {
    Rab = Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0])
        + (p1[1] - p2[1]) * (p1[1] - p2[1]) +
        (p1[2] - p2[2]) * (p1[2] - p2[2]));
    k = r / Rab;
    Xc = p1[0] + (p2[0] - p1[0]) * k;
    Yc = p1[1] + (p2[1] - p1[1]) * k;
    Zc = p1[2] + (p2[2] - p1[2]) * k;

    var res = [];
    res.push(Xc);
    res.push(Yc);
    res.push(Zc);

    return res;

}

var Models = [];
function Model(filename, name, color) {
    this.controlMesh =
    {
        points: [],
        cells: [],
        triangles: [],
        normals: [],
        BC: []

    }
    this.currentMesh =
    {
        points: [],
        cells: [],
        triangles: [],
        normals: [],
        BC: []

    }
    this.movable = false;
    this.startBasis = [];
    this.endBasis = [];
    this.filename = filename;
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
        //var normals = new Float32Array(this.currentMesh.normals);
        var temp_color = new THREE.Color(this.current_color);
        //console.log(temp_color);
        var colors = this.getColorArray(temp_color);
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        //geometry.addAttribute( 'normal', new THREE.BufferAttribute(normals , 3 ) );
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3, true));
        geometry.computeVertexNormals();

        geometry.attributes.color.needsUpdate = true;
        this.geo = new THREE.Geometry().fromBufferGeometry(geometry);

        this.mesh = new THREE.Mesh(geometry, material);
        //this.mesh.doubleSided = true;


    }

    this.Hide = function (scene) {
        if (this.mesh != null)
            scene.remove(this.mesh);
        if (this.wireframe != null)
            scene.remove(this.wireframe);
    }

    this.refreshDisplay = function (scene) {

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

                //material.color = new THREE.Color(this.current_color);
                //material.color = new THREE.Color(this.default_color.r, this.default_color.g, this.default_color.b);


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

        this.indices = new Array(this.planes.length + 1);
        for (i = 0; i < this.indices.length; ++i) {
            this.indices[i] = []
        }

        if (this.planes.length == 0) {
            for (i = 0; i < Mesh.points.length; i += 3) {
                this.indices[0].push(i / 3);
            }

        }
        else {
            for (i = 0; i < Mesh.points.length; i += 3) {
                for (j = 0; j < this.planes.length; ++j) {
                    var x = Mesh.points[i];
                    var y = Mesh.points[i + 1];
                    var z = Mesh.points[i + 2];
                    if (j == 0) {
                        if (this.whereDot(x, y, z, this.planes[j]) < 0) {
                            this.indices[j].push(i / 3);
                        }
                    }
                    if (j != 0) {
                        if (this.whereDot(x, y, z, this.planes[j - 1]) > 0 &&
                            this.whereDot(x, y, z, this.planes[j]) < 0) {
                            this.indices[j].push(i / 3);
                        }
                    }
                    if (j == this.planes.length - 1) {
                        if (this.whereDot(x, y, z, this.planes[j]) > 0)
                            this.indices[j + 1].push(i / 3);
                    }


                }

            }
        }

        for (i = 0; i < this.indices.length; ++i) {
            for (j = 0; j < this.indices[i].length; ++j) {
                var ind = this.indices[i][j];
                var x = Mesh.points[ind * 3];
                var y = Mesh.points[ind * 3 + 1];
                var z = Mesh.points[ind * 3 + 2];

                var coords = this.getBc(x, y, z, this.basis[i]);


                Mesh.BC[ind * 4] = coords[0];
                Mesh.BC[ind * 4 + 1] = coords[1];
                Mesh.BC[ind * 4 + 2] = coords[2];
                Mesh.BC[ind * 4 + 3] = coords[3];
            }

        }

    }


    this.parseFile = function (data) {
        var lines = data.split("\n");
        var counts = lines[0].split(" ");

        var v = parseInt(counts[0]);
        var ed = parseInt(counts[1]);
        var f = parseInt(counts[2]);

        var edges = [];

        for (i = 1; i <= v; ++i) {
            var val = lines[i].split(/\s+/);

            for (j = 0; j < val.length - 1; ++j) {
                this.controlMesh.points.push(parseFloat(val[j]));
                this.currentMesh.points.push(parseFloat(val[j]));
                j++;
                this.controlMesh.points.push(parseFloat(val[j]));
                this.currentMesh.points.push(parseFloat(val[j]));
                j++;
                this.controlMesh.points.push(parseFloat(val[j]));
                this.currentMesh.points.push(parseFloat(val[j]));
            }
        }
        for (i = v + 1; i <= v + ed; ++i) {
            var val = lines[i].split(/\s+/);
            for (j = 0; j < val.length - 1; ++j) {
                edges.push(parseInt(val[j]));
                j++;
                edges.push(parseInt(val[j]));
                j++;
            }
        }
        for (i = v + ed + 1; i <= v + ed + f; ++i) {
            var val = lines[i].split(/\s+/);
            if (val[0] != 'f') continue;
            var figure_type = parseInt(val[1]);
            var a = [];
            var e, ind;

            for (var j = 2; j < 2 + figure_type; ++j) {
                e = parseInt(val[j]);
                ind = (e >= 0) ? e * 2 : (-1 * e - 1) * 2 + 1;
                a.push(edges[ind]);
            }
            this.controlMesh.cells.push(a);
            this.currentMesh.cells.push(a);
        }
        this.convertToTriangles(this.controlMesh);
        this.convertToTriangles(this.currentMesh);

        if (this.basis.length != 0) {
            this.setBC(this.currentMesh);
            this.setBC(this.controlMesh);
        }
        //this.setBuffers(gl);


    }

    this.initialize = function () {

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", this.filename, false);
        var obj = this;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {

                //alert(xmlhttp.responseText);
                obj.parseFile(xmlhttp.responseText);
                console.log('received')
            }
        };
        xmlhttp.send();
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
        this.currentMesh.normals = [];
        this.currentMesh.triangles = [];
        this.currentMesh.BC = [];
        for (var i = 0; i < this.controlMesh.points.length; ++i) {
            this.currentMesh.points.push(this.controlMesh.points[i]);
            this.currentMesh.normals.push(this.controlMesh.normals[i]);
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
            }
            this.avgh = obj.avgh;
        }

        //lv.refreshBuffers(gl);
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

    this.whereDot = function (x, y, z, plane) {

        return x * plane[0] + y * plane[1] + z * plane[2] + plane[3];
    }

    this.refreshPoints = function () {
        this.mesh.geometry.removeAttribute('position');

        var vertices = new Float32Array(this.currentMesh.points);
        this.mesh.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        this.mesh.geometry.computeVertexNormals();
        this.mesh.geometry.attributes.position.needsUpdate = true;


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

function addPlanes() {
    lv.addBasis([0.10213088989257812, 0.22570419311523438, 0.0715399980545044],
        [-0.20702289044857025, 0.07114315032958984, 0.17646244168281555],
        [-0.13945525884628296, -0.1787872314453125, -0.04774206876754761],
        [-0.0019055306911468506, -0.2848224639892578, 0.29920125007629395]);


    lv.addBasis([0.10213088989257812, 0.22570419311523438, 0.0715399980545044],
        [-0.20702289044857025, 0.07114315032958984, 0.17646244168281555],
        [-0.13945525884628296, -0.1787872314453125, -0.04774206876754761],
        [-0.3136921525001526, 0.22571659088134766, -0.04268912971019745]);

    lv.addBasis([-0.16061154007911682, -0.02810955047607422, -0.16513176262378693],
        [-0.3136921525001526, 0.22571659088134766, -0.04268912971019745],
        [-0.11410201340913773, 0.3929176330566406, -0.03646336495876312],
        [-0.2843323349952698, 0.4550352096557617, -0.21744248270988464]);


    lv.addPlane(
        [0.10213088989257812, 0.22570419311523438, 0.0715399980545044],
        [-0.13945525884628296, -0.1787872314453125, -0.04774206876754761],
        [-0.20702289044857025, 0.07114315032958984, 0.17646244168281555]
    );
    lv.addPlane(
        [-0.16061154007911682, -0.02810955047607422, -0.16513176262378693],
        [-0.3136921525001526, 0.22571659088134766, -0.04268912971019745],
        [-0.11410201340913773, 0.3929176330566406, -0.03646336495876312]
    );


    rv.addBasis([-0.35015079379081726, -0.1768198013305664, 0.11724582314491272],
        [-0.11318855732679367, 0.3041553497314453, 0.22425678372383118],
        [-0.3584112226963043, 0.08575248718261719, 0.3082144856452942],
        [-0.10835719108581543, -0.2565488815307617, 0.32227885723114014]);
    rv.addBasis([-0.35015079379081726, -0.1768198013305664, 0.11724582314491272],
        [-0.11318855732679367, 0.3041553497314453, 0.22425678372383118],
        [-0.3584112226963043, 0.08575248718261719, 0.3082144856452942],
        [-0.15829023718833923, 0.42951107025146484, 0.15186932682991028]
    );

    rv.addBasis([-0.3591584265232086, -0.12734413146972656, 0.021600425243377686],
        [-0.279879629611969, -0.05502510070800781, -0.022744715213775635],
        [-0.15829023718833923, 0.42951107025146484, 0.15186932682991028],
        [-0.2228027880191803, 0.5965023040771484, -0.05293671786785126]);

    rv.addPlane([-0.11318855732679367, 0.3041553497314453, 0.22425678372383118],
        [-0.35015079379081726, -0.1768198013305664, 0.11724582314491272],
        [-0.3584112226963043, 0.08575248718261719, 0.3082144856452942]);

    rv.addPlane([-0.279879629611969, -0.05502510070800781, -0.022744715213775635],
        [-0.3591584265232086, -0.12734413146972656, 0.021600425243377686],
        [-0.15829023718833923, 0.42951107025146484, 0.15186932682991028]
    );

    heart.addBasis([0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
        [-0.3907685875892639, 0.11402428150177002, 0.36649852991104126],
        [-0.2286313772201538, -0.2439173460006714, 0.05095013976097107],
        [0.008711280301213264, -0.3656548261642456, 0.2989342212677002]);

    heart.addBasis([0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
        [-0.3907685875892639, 0.11402428150177002, 0.36649852991104126],
        [-0.2286313772201538, -0.2439173460006714, 0.05095013976097107],
        [0.03413081169128418, 0.2572900056838989, -0.12180556356906891]
    );

    heart.addBasis(
        [-0.4467030167579651, 0.23485100269317627, 0.2780473828315735],
        [-0.24223551154136658, -0.0928419828414917, -0.16487106680870056],
        [0.03413081169128418, 0.2572900056838989, -0.12180556356906891],
        [-0.1346123069524765, 1.2851229906082153, -0.6363239288330078]);


    heart.addPlane([-0.3907685875892639, 0.11402428150177002, 0.36649852991104126],
        [0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
        [-0.2286313772201538, -0.2439173460006714, 0.05095013976097107]
    );


    heart.addPlane([0.03413081169128418, 0.2572900056838989, -0.12180556356906891],
        [-0.24223551154136658, -0.0928419828414917, -0.16487106680870056],
        [-0.4467030167579651, 0.23485100269317627, 0.2780473828315735]
    );
    /*
     heart_arteries.addBasis([0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
     [-0.3907685875892639, 0.11402428150177002,  0.36649852991104126],
     [ -0.2286313772201538,  -0.2439173460006714, 0.05095013976097107],
     [0.008711280301213264, -0.3656548261642456, 0.2989342212677002]);

     heart_arteries.addBasis([0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
     [-0.3907685875892639, 0.11402428150177002,  0.36649852991104126],
     [ -0.2286313772201538,  -0.2439173460006714, 0.05095013976097107],
     [0.03413081169128418,  0.2572900056838989,  -0.12180556356906891]

     );

     heart_arteries.addBasis(
     [-0.4467030167579651, 0.23485100269317627, 0.2780473828315735],
     //[-0.2934698462486267,  -0.2029494047164917,  0.011708710342645645],
     [-0.24223551154136658, -0.0928419828414917, -0.16487106680870056],
     [0.03413081169128418,  0.2572900056838989,  -0.12180556356906891],
     [-0.1346123069524765, 1.2851229906082153, -0.6363239288330078]);


     heart_arteries.addPlane(     [-0.3907685875892639, 0.11402428150177002,  0.36649852991104126],
     [0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
     [ -0.2286313772201538,  -0.2439173460006714, 0.05095013976097107]

     );


     heart_arteries.addPlane( [-0.4467030167579651, 0.23485100269317627, 0.2780473828315735],
     [0.03413081169128418,  0.2572900056838989,  -0.12180556356906891],
     [-0.24223551154136658, -0.0928419828414917, -0.16487106680870056]

     );

     heart_veins.addBasis([0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
     [-0.3907685875892639, 0.11402428150177002,  0.36649852991104126],
     [ -0.2286313772201538,  -0.2439173460006714, 0.05095013976097107],
     [0.008711280301213264, -0.3656548261642456, 0.2989342212677002]);

     heart_veins.addBasis([0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
     [-0.3907685875892639, 0.11402428150177002,  0.36649852991104126],
     [ -0.2286313772201538,  -0.2439173460006714, 0.05095013976097107],
     [0.03413081169128418,  0.2572900056838989,  -0.12180556356906891]

     );

     heart_veins.addBasis(
     [-0.4467030167579651, 0.23485100269317627, 0.2780473828315735],
     //[-0.2934698462486267,  -0.2029494047164917,  0.011708710342645645],
     [-0.24223551154136658, -0.0928419828414917, -0.16487106680870056],
     [0.03413081169128418,  0.2572900056838989,  -0.12180556356906891],
     [-0.1346123069524765, 1.2851229906082153, -0.6363239288330078]);


     heart_veins.addPlane(     [-0.3907685875892639, 0.11402428150177002,  0.36649852991104126],
     [0.1331649273633957, 0.2209569215774536, 0.01949555054306984],
     [ -0.2286313772201538,  -0.2439173460006714, 0.05095013976097107]

     );


     heart_veins.addPlane( [-0.4467030167579651, 0.23485100269317627, 0.2780473828315735],
     [0.03413081169128418,  0.2572900056838989,  -0.12180556356906891],
     [-0.24223551154136658, -0.0928419828414917, -0.16487106680870056]

     );*/


    /*mitral.addBasis([0.10213088989257812, 0.22570419311523438, 0.0715399980545044],
     [-0.20702289044857025, 0.07114315032958984, 0.17646244168281555],
     [-0.13945525884628296, -0.1787872314453125, -0.04774206876754761],
     [-0.0019055306911468506, -0.2848224639892578, 0.29920125007629395]);*/
    mitral.addBasis([-0.10953882336616516, 0.22584927082061768, -0.13229212164878845],
        [-0.11456591635942459, 0.10668575763702393, -0.14722025394439697],
        [-0.19143836200237274, 0.1624852418899536, -0.146833136677742],
        [-0.06723282854999998, 0.06897249222500001, 0.055131804300000004]);
    mitral.addBasis([-0.10953882336616516, 0.22584927082061768, -0.13229212164878845],
        [-0.11456591635942459, 0.10668575763702393, -0.14722025394439697],
        [-0.19143836200237274, 0.1624852418899536, -0.146833136677742],
        [-0.0019055306911468506, -0.2848224639892578, 0.29920125007629395]);


    /*mitral.addPlane(
     [ -0.09838581085205078,  0.20384705066680908,  -0.11205940693616867],
     [ -0.14224541187286377,  0.054638028144836426,  -0.1382569670677185],
     [ -0.17277425527572632,  0.1803818941116333,  -0.09236793965101242]

     );*/

    mitral.addPlane([-0.10950642824172974, 0.2597571611404419, -0.1614927351474762],
        [-0.12796679139137268, 0.08635914325714111, -0.18581940233707428],
        [-0.27106010913848877, 0.09588252753019333, -0.18817803263664246]);

    mitral.planes[0][3] += 0.0025;

    tricuspid.addBasis([-0.34945085644721985, 0.02209397964179516, -0.04655905067920685],
        [-0.3438231945037842, 0.14108392596244812, -0.021924829110503197],
        [-0.37541380524635315, 0.040794581174850464, 0.08406344056129456],
        [-0.25731264130434783, 0.04981530221304347, 0.20386723265217388]);

    tricuspid.addBasis([-0.34945085644721985, 0.02209397964179516, -0.04655905067920685],
        [-0.3438231945037842, 0.14108392596244812, -0.021924829110503197],
        [-0.37541380524635315, 0.040794581174850464, 0.08406344056129456],
        [-0.25731264130434783, 0.04981530221304347, 0.20386723265217388]);

    tricuspid.addPlane([-0.33554160594940186, 0.15473482012748718, -0.0800919309258461],
        [-0.3532155454158783, -0.024890689179301262, -0.0709177777171135],
        [-0.4137941300868988, 0.07311937212944031, 0.0675794780254364]);

    tricuspid.planes[0][3] += 0.002;
}

function addAllEndBasis() {
    mitral.setAvgh();
    mitral.basis[1][3] = mitral.avgh;

    rv.initEndBasis(rvAVG, 0.05, 0.05, 0.05, 0.1, 0);
    rv.initEndBasis(rvAVG, 0.05, 0.05, 0.05, 0, 1);
    rv.initEndBasis(rvAVG, 0, 0, 0, 0, 2);
    lv.initEndBasis(lvAVG, 0.05, 0.05, 0.05, 0.1, 0);
    lv.initEndBasis(lvAVG, 0.03, 0.03, 0.03, 0, 1);
    lv.initEndBasis(lvAVG, 0, 0, 0, 0, 2);
    heart.initEndBasis(avg, 0.03, 0.03, 0.03, 0.05, 0);
    heart.initEndBasis(avg, 0.03, 0.03, 0.03, 0, 1);
    heart.initEndBasis(avg, 0, 0, 0, 0, 2);
    var a = getAvg([mitral.basis[1][0], mitral.basis[1][1], mitral.basis[1][2]]);
    //addDot(new THREE.Vector3(a[0], a[1], a[2]));
    //mitral.initEndBasis(lvAVG, 0.05, 0.05, 0.05, 0, 0);
    mitral.initEndBasis(a, 0.03, 0.03, 0.03, 0, 0);
    mitral.initEndBasis(a, 0, 0, 0, 0, 1);
    var b = getAvg([tricuspid.basis[1][0], tricuspid.basis[1][1], tricuspid.basis[1][2]]);

    tricuspid.initEndBasis(b, 0.03, 0.03, 0.03, 0, 0);
    tricuspid.initEndBasis(b, 0, 0, 0, 0, 1);
    /*
     heart_arteries.initEndBasis(avg, 0.03, 0.03, 0.03, 0.05, 0);
     heart_arteries.initEndBasis(avg, 0.03, 0.03, 0.03, 0, 1);
     heart_arteries.initEndBasis(avg, 0, 0, 0, 0, 2);

     heart_veins.initEndBasis(avg, 0.03, 0.03, 0.03, 0.05, 0);
     heart_veins.initEndBasis(avg, 0.03, 0.03, 0.03, 0, 1);
     heart_veins.initEndBasis(avg, 0, 0, 0, 0, 2);
     */
}

function initMoving() {
    addPlanes();
    addAllEndBasis();
}


var heart_arteries = new Model("heart_arteries.txt", "Heart_Arteries", "#c70000");
var heart_veins = new Model("heart_veins.txt", "Heart_Veins", "#335e92");
var mitral = new Model("valve2.txt", "Mitral_Valve", "#ffe6e6");
var aortha = new Model("Aortha.txt", "Aortha", "#c70000");

var tricuspid = new Model("tricuspid_valve.txt", "Tricuspid_Valve", "#ffe6e6");
var pulmonary = new Model("Pulmonary.txt", "Pulmonary_Artery", "#335e92");

var la = new Model("Left_atrium2.txt", "Left_Atrium", "#c70000");
var ra = new Model("Right_atrium2.txt", "Right_Atrium", "#335e92");


var lv = new Model("Left_ventricle.txt", "lv", "#c70000");


var rv = new Model("Right_ventricle.txt", "rv", "#335e92");


var heart = new Model("heart.txt", "Heart", "#bf4040");



