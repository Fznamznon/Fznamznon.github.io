/**
 * Created by Мария on 06.05.2017.
 */
function getAvg(points) {
    var arr = [0.0, 0.0, 0.0];
    for (var i = 0; i < points.length; ++i) {
        arr[0] += points[i][0];
        arr[1] += points[i][1];
        arr[2] += points[i][2];
    }
    arr[0] /= points.length;
    arr[1] /= points.length;
    arr[2] /= points.length;

    return arr;
}

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

function whereDot(x, y, z, plane) {

    return x * plane[0] + y * plane[1] + z * plane[2] + plane[3];
}

function showBasis(basis, color) {
    var v1 = new THREE.Vector3(basis[0][0], basis[0][1], basis[0][2]);
    var v2 = new THREE.Vector3(basis[1][0], basis[1][1], basis[1][2]);
    var v3 = new THREE.Vector3(basis[2][0], basis[2][1], basis[2][2]);
    var v4 = new THREE.Vector3(basis[3][0], basis[3][1], basis[3][2]);

    addDot(v1, color);
    addDot(v2, color);
    addDot(v3, color);
    addDot(v4, color);

    var g = new THREE.TetrahedronGeometry(1, 0);
    g.vertices[0] = v1;
    g.vertices[1] = v2;
    g.vertices[2] = v3;
    g.vertices[3] = v4;

    g.verticesNeedUpdate = true;

    var m = new THREE.MeshBasicMaterial({color: color, wireframe: true});

    var mesh = new THREE.Mesh(g, m);
    scene.add(mesh);

}
