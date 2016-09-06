/**
 * Created by Мария on 09.08.2016.
 */
var Models = [];
function Model(filename, basis, color) {
    this.controlMesh =
    {
        points : [],
        cells : [],
        triangles : [],
        normals : [],
        BC : []

    }
    this.currentMesh =
    {
        points : [],
        cells : [],
        triangles : [],
        normals : [],
        BC : []

    }

    this.filename = filename;
    this.basis = basis;
    this.wireframeMode = 0;
    this.visible = true;
    this.default_color = new THREE.Color(color);

    //this.GLVertexPositionBuffer = null;
    //this.GLVertexIndicesBuffer = null;
    //this.GLNormalBuffer = null;
    //this.BCbuf = null;

    this.mesh = null;
    this.wireframe = null;
    Models.push(this);

    this.refreshMesh = function (scene, material) {

        var geometry = new THREE.BufferGeometry();

        var vertices = new Float32Array(this.currentMesh.points);
        var indices = new Uint32Array( this.currentMesh.triangles);
        var normals = new Float32Array(this.currentMesh.normals);
        geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );

        geometry.addAttribute( 'position', new THREE.BufferAttribute(vertices , 3 ) );
        geometry.addAttribute( 'normal', new THREE.BufferAttribute(normals , 3 ) );

        this.mesh = new THREE.Mesh( geometry, material );
        //this.mesh.doubleSided = true;
    }

    this.Hide = function(scene) {
        if (this.mesh != null)
            scene.remove(this.mesh);
        if (this.wireframe != null)
            scene.remove(this.wireframe);
    }

    this.refreshDisplay = function(scene) {
        if (this.mesh != null)
            scene.remove(this.mesh);
        if (this.wireframe != null)
            scene.remove(this.wireframe);
        this.mesh = null;
        this.wireframe = null;
        var material;

        switch (this.wireframeMode){
            case 0:
                material = new THREE.MeshLambertMaterial();
                material.color = this.default_color;
                material.side = THREE.DoubleSide;
                this.refreshMesh(scene, material);
                break;
            case 1:
                material = new THREE.MeshLambertMaterial();
                material.color = this.default_color;

                material.side = THREE.DoubleSide;
                this.refreshMesh(scene, material);
                this.wireframe = new THREE.WireframeHelper( this.mesh, 0x0000ff);
                scene.add(this.wireframe);
                break;

            case 2:
                material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
                material.side = THREE.DoubleSide;
                this.refreshMesh(scene, material);
                break;

        }
        scene.add(this.mesh);

    }

    this.convertToTriangles = function(Mesh) {
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

    this.getNormal = function(a, b, c, vertexPositions)
    {
        var v1x = vertexPositions[3 * b] - vertexPositions[3 * a];
        var v1y = vertexPositions[3 * b + 1] - vertexPositions[3 * a + 1];
        var v1z = vertexPositions[3 * b + 2] - vertexPositions[3 * a + 2];

        var v2x = vertexPositions[3 * c] - vertexPositions[3 * a];
        var v2y = vertexPositions[3 * c + 1] - vertexPositions[3 * a + 1];
        var v2z = vertexPositions[3 * c + 2] - vertexPositions[3 * a + 2];


        var r = [];
        var module = Math.sqrt((v1y * v2z - v2y * v1z) * (v1y * v2z - v2y * v1z)  +
            (v1z * v2x - v2z * v1x) * (v1z * v2x - v2z * v1x) +
            (v1x * v2y - v2x * v1y) * (v1x * v2y - v2x * v1y));
        r.push((v1y * v2z - v2y * v1z) / module);
        r.push((v1z * v2x - v2z * v1x) / module);
        r.push((v1x * v2y - v2x * v1y) / module);
        
        return r;

    }

    this.setNormal = function(a, normal, normalBuffer) {
        normalBuffer[3 * a] = normal[0];
        normalBuffer[3 * a + 1] = normal[1];
        normalBuffer[3 * a + 2] = normal[2];
    }

    this.calcNormals = function(Mesh) {


        var triangles = Mesh.triangles;
        var points = Mesh.points;
        var a, b, c;
        var normal;
        Mesh.normals = new Array(points.length);
        for (var i = 0; i < triangles.length; i += 3) { 
            a = triangles[i];
            b = triangles[i + 1];
            c = triangles[i + 2];
            
            normal = this.getNormal(a, c, b, points);
            this.setNormal(a, normal, Mesh.normals);

            normal = this.getNormal(b, a, c, points);
            this.setNormal(b, normal, Mesh.normals);

            normal = this.getNormal(c, b, a, points);
            this.setNormal(c, normal, Mesh.normals);


        }
    }

    this.getBc = function(x, y, z){
        var coords = [];
        var b1 = this.basis[0];
        var b2 = this.basis[1];
        var b3 = this.basis[2];
        var b4 = this.basis[3];
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

    this.rtd = function(m1, m2, m3, m4){
        var coords = [];
        var b1 = basis[0];
        var b2 = basis[1];
        var b3 = basis[2];
        var b4 = basis[3];
        coords.push((m1 * b1[0] + m2 * b2[0] + m3 * b3[0] + m4 * b4[0]) / (m1 + m2 + m3 + m4));
        coords.push((m1 * b1[1] + m2 * b2[1] + m3 * b3[1] + m4 * b4[1]) / (m1 + m2 + m3 + m4));
        coords.push((m1 * b1[2] + m2 * b2[2] + m3 * b3[2] + m4 * b4[2]) / (m1 + m2 + m3 + m4));
        return coords;
    }

    this.setBC = function(Mesh) {
        Mesh.BC = [];

        for (i = 0; i < Mesh.points.length; i+=3)
        {
            var coords = this.getBc(Mesh.points[i], Mesh.points[i + 1], Mesh.points[i + 2]);
            Mesh.BC.push(coords[0]);
            Mesh.BC.push(coords[1]);
            Mesh.BC.push(coords[2]);
            Mesh.BC.push(coords[3]);


        }
    }
    



    this.parseFile = function(data) {
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
            for (j = 0; j < val.length - 1; ++j){
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

            for (var j = 2; j < 2 + figure_type; ++j)
            {
                e = parseInt(val[j]);
                ind = (e >= 0)? e * 2 : (-1 * e - 1) * 2 + 1;
                a.push(edges[ind]);
            }
            this.controlMesh.cells.push(a);
            this.currentMesh.cells.push(a);
        }
        this.convertToTriangles(this.controlMesh);
        this.convertToTriangles(this.currentMesh);
        this.calcNormals(this.controlMesh);
        this.calcNormals(this.currentMesh);
        if (this.basis.length == 0){

            var b1 = [];
            var b2 = [];
            var b3 = [];
            var b4 = [];

            b1.push(this.currentMesh.points[297 * 3]);

            b1.push(this.currentMesh.points[297 * 3 + 1]);
            b1.push(this.currentMesh.points[297 * 3 + 2]);

            b2.push(this.currentMesh.points[680 * 3]);
            b2.push(this.currentMesh.points[680 * 3 + 1]);
            b2.push(this.currentMesh.points[680 * 3 + 2]);

            b3.push(this.currentMesh.points[704 * 3]);
            b3.push(this.currentMesh.points[704 * 3 + 1]);
            b3.push(this.currentMesh.points[704 * 3 + 2]);

            b4.push(this.currentMesh.points[24 * 3]);
            b4.push(this.currentMesh.points[24 * 3 + 1]);
            b4.push(this.currentMesh.points[24 * 3 + 2]);
            this.basis.push(b1);
            this.basis.push(b2);
            this.basis.push(b3);
            this.basis.push(b4);
        }
        this.setBC(this.currentMesh);
        this.setBC(this.controlMesh);
        //this.setBuffers(gl);


    }
    
    this.initialize = function() {

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", this.filename, false);
        var obj = this;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4)
            {
                
                //alert(xmlhttp.responseText);
                obj.parseFile(xmlhttp.responseText);
                console.log('received')
            }
        };
        xmlhttp.send();
    }
    
    this.changeBasis = function()
    {
        this.currentMesh.points = [];
        BC = this.currentMesh.BC;
        for (var i = 0; i < BC.length; i += 4)
        {
            var coords = this.rtd(BC[i], BC[i + 1], BC[i + 2], BC[i + 3]);
            this.currentMesh.points.push(coords[0]);
            this.currentMesh.points.push(coords[1]);
            this.currentMesh.points.push(coords[2]);
        }
        this.calcNormals(this.currentMesh);

    }
    this.returnToControlMesh = function() {
        this.currentMesh.points = [];
        this.currentMesh.normals= [];
        this.currentMesh.triangles = [];
        this.currentMesh.BC = [];
        for (var i = 0; i < this.controlMesh.points.length; ++i) {
            this.currentMesh.points.push(this.controlMesh.points[i]);
            this.currentMesh.normals.push(this.controlMesh.normals[i]);
        }
        for (var i = 0; i < this.controlMesh.triangles.length; ++i) {
            this.currentMesh.triangles.push(this.controlMesh.triangles[i]);
        }
        for (var i = 0; i < this.controlMesh.BC.length; ++i) {
            this.currentMesh.BC.push(this.controlMesh.BC[i]);
        }
    }
    this.updateSubdiv = function(numSubdivisions) {

        if (numSubdivisions == 0)
            this.returnToControlMesh();
        else {
            var obj = catmullClark(this.controlMesh.points, this.controlMesh.cells, numSubdivisions);
            this.currentMesh.points = obj.points;
            this.currentMesh.cells = obj.cells;
            this.convertToTriangles(this.currentMesh);
            this.calcNormals(this.currentMesh);
            this.setBC(this.currentMesh);
        }

        //lv.refreshBuffers(gl);
    }
}

var lv = new Model("left_atrium.txt", [], "#c70000");
var heart = new Model("heart.txt", [], "#bf4040");
var rv = new Model("right_atrium.txt", [], "#335e92");
var tricuspid = new Model("tricuspid_valve.txt", [], "#ffe6e6");
var mitral = new Model("valve2.txt", [], "#ffe6e6");
var heart_arteries = new Model("heart_arteries.txt", [], "#c70000");
var heart_veins= new Model("heart_veins.txt", [], "#335e92");