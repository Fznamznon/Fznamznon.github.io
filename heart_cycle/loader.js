/**
 * Created by Мария on 05.05.2017.
 */
function Loader() {

    this.parseFile = function (data) {
        var result =
        {
            points: [],
            cells: []

        }

        var lines = data.split("\n");
        var counts = lines[0].split(" ");

        var v = parseInt(counts[0]);
        var ed = parseInt(counts[1]);
        var f = parseInt(counts[2]);

        var edges = [];

        for (i = 1; i <= v; ++i) {
            var val = lines[i].split(/\s+/);

            for (j = 0; j < val.length - 1; ++j) {
                result.points.push(parseFloat(val[j]));
                //.currentMesh.points.push(parseFloat(val[j]));
                j++;
                result.points.push(parseFloat(val[j]));
                //.currentMesh.points.push(parseFloat(val[j]));
                j++;
                result.points.push(parseFloat(val[j]));
                //this.currentMesh.points.push(parseFloat(val[j]));
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
            result.cells.push(a);
            //this.currentMesh.cells.push(a);
        }
        //this.convertToTriangles(this.controlMesh);
        //this.convertToTriangles(this.currentMesh);

        return result;

        //this.setBuffers(gl);


    }

    this.load = function (filename) {

        var arrays;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", filename, false);
        xmlhttp.send(null);
        var obj = this;

        if (xmlhttp.status == 200) {
            arrays = obj.parseFile(xmlhttp.responseText);
        }
        return arrays;
        /*
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {

                //alert(xmlhttp.responseText);
                console.log('received')
            }
        };
        xmlhttp.send();*/
    }

}

var loader = new Loader();
