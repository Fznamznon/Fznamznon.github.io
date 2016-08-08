var Bones = [];
var Compex_Motions = [];

function Bone(filename, Joint, Visible, parent, childs) {
    this.filename = filename;
    this.VertexPositionBuffer = null;
    this.VertexIndicesBuffer = null;
    this.Joint = Joint;
    this.Visible = Visible;
    this.Childs = childs;
    Bones.push(this);
    if (parent != null)
        parent.Childs.push(this);
    this.NormalBuffer = null;
}

function Joint(location, orientation, movable) {

    this.location = location;
    this.orientation = orientation;
    this.movable = movable;
    this.Motions = [];
    this.addMotion = function (motion) {
        this.Motions.push(motion);
    }
}

function Motion(axis, min, max, cur_value, name) {
    this.axis = axis;
    this.min = min;
    this.max = max;
    this.cur_value = cur_value;
    this.name = name;
}

function Complex_Motion(name) {
    this.motions = [];
    this.T = 0;

    this.linAppr = function(x1, y1, x2, y2, t)
    {
        return y1 + (y2 - y1)/(x2 - x1)*(t - x1);
    }
    
    this.add = function (motion) {
        this.motions.push(motion);
    }
    this.name = name;
    Compex_Motions.push(this);
}

//var point_finger_flexion = new Complex_Motion("point_finger_flexion");


var humerus = new Bone("output.txt", null, true, null, [] );

/*var elbow_flexion = new Motion([0.226046935824, 0.191039945763, 0.955199728815],
    0.0,
    2.268928027593,
    0.0,
    "elbow_flexion"
);


var elbow = new Joint(
    [0.0127, -0.274, 0.0389],
    [0, 0, 0],
    true
);

elbow.addMotion(elbow_flexion);

var ulna = new Bone("bones/_ulna.asc", elbow, true, humerus, [] );

var pro_sup = new Motion(
    [0.056398022307, 0.983577389037, -0.171449067814],
    -1.570796326795,
    1.570796326795,
    0.0,
    "pro_sup"
);


var radioulnar = new Joint(

    [-0.0065, -0.008, 0.027],
    [0, 0, 0],
    true
);

radioulnar.addMotion(pro_sup);

var radius = new Bone("bones/_radius.asc", radioulnar, true, ulna, []);

var rad_rotaxis = new Joint(
    [-0.0085, -0.2313, 0.0561],
    [-0.261799387799, 0.392699081699, 0.0],
    false

);

var rotaxis = new Bone(null, rad_rotaxis, false, radius, []);

var flexion = new Motion(
    [0, 0, 1],
    -1.221730476396,
    1.221730476396,
    0.0,
    "flexion"
);

var rotaxis_auxprfem = new Joint(
    [-0.001, 0.009, 0.0],
    [0, 0, 0],
    true
);

rotaxis_auxprfem.addMotion(flexion);

var auxprfem = new Bone(null, rotaxis_auxprfem, false, rotaxis, []);

var deviation = new Motion(
    [1, 0, 0],
    -0.436332312999,
    0.610865238198,
    0.0,
    "deviation"
);

var auxprfem_auxprrud = new Joint(
    [0, 0, 0],
    [0, 0, 0],
    true
);
auxprfem_auxprrud.addMotion(deviation);


var auxprrud = new Bone(null, auxprfem_auxprrud, false, auxprfem, []);

var auxprrud_auxdrfem = new Joint(
    [0.001, -0.02, 0.0],
    [0, 0, 0],
    false
);

var auxdrfem = new Bone(null, auxprrud_auxdrfem, false, auxprrud, []);

var auxdrfem_auxdrrud = new Joint(
    [0, 0, 0],
    [0, 0, 0],
    false
);


var auxdrrud = new Bone(null, auxdrfem_auxdrrud, false, auxdrfem, []);

var prox_scaph = new Joint(
    [-0.0035, -0.0025, 0.009],
    [0.401425727959, 0.0, 0.0],
    false
);

var scaphoid = new Bone("bones/_r_scaph.asc", prox_scaph, true, auxprrud, []);

var prox_lun = new Joint(
    [-0.004, -0.0015, -0.007],
    [0, 0, 0],
    false
);

var lunate = new Bone("bones/_r_lun.asc", prox_lun, true, auxprrud, []);

var dist_trpzm = new Joint(
    [0.0035, -0.0035, 0.02],
    [-0.261799387799, 0.0, 0.0],
    false
);

var trapezium = new Bone("bones/_r_trpzm.asc", dist_trpzm, true, auxdrrud, []);

var dist_trpzd = new Joint(
    [-0.0015, -0.0044, 0.0134],
    [0.349065850399, -0.174532925199, 0.0],
    false
);

var trapezoid = new Bone("bones/_r_trpzd.asc", dist_trpzd, true, auxdrrud, []);

var dist_cap = new Joint(
    [-0.0155, -0.0018, -0.0055],
    [0.174532925199, 0.0, 0.0],
    false
);

var capitate = new Bone("bones/_r_cap.asc", dist_cap, true, auxdrrud, []);

var prox_pis = new Joint(
    [0.005, -0.015, -0.0201],
    [0, 0, 0],
    false
);

var pisiform = new Bone("bones/_r_pis.asc", prox_pis, true, auxprrud, []);

var prox_triq = new Joint(
    [-0.0055, -0.01, -0.021],
    [0, 0, 0],
    false
);

var triquetrum = new Bone("bones/_r_triq.asc",  prox_pis, true, auxprrud, []);

var dist_ham = new Joint(
    [-0.006, -0.005, -0.0175],
    [-0.209439510239, 0.0, 0.0],
    false
);

var hamate = new Bone("bones/_r_ham.asc", dist_ham, true, auxdrrud, []);

var auxCMC = new Joint(
    [0, 0, 0],
    [0, 0, 0],
    false
);

var carp_metacarp = new Bone(null, auxCMC, false, auxdrrud, []);

var CMC2 = new Joint(
    [-0.0047, -0.0095, -0.005],
    [0.174532925199, 0.261799387799, 0.0],
    false
);

var metacarpal2 = new Bone("bones/_fingers1.asc", CMC2, true,  carp_metacarp, []);

var MCP2_lateral = new Motion(
    [1, 0, 0],
    -0.349065850399,
    0.349065850399,
    0,
    "MCP2_lateral"
);

var MCP2_flex = new Motion(
    [0, 0, 1],
    -0.174532925199,
    1.570796326795,
    0,
    "MCP2_flex"
);

var MCP2 = new Joint(
    [-0.0024, -0.0685, 0.045],
    [0 ,0, 0],
    true
);

MCP2.addMotion(MCP2_lateral);
MCP2.addMotion(MCP2_flex);
point_finger_flexion.add(MCP2_flex);
//point_finger_flexion.add(MCP2_lateral);



var Iphalanx1 = new Bone("bones/_fingers2.asc", MCP2, true, metacarpal2, []);

var PIP_flex = new Motion(
    [0, 0, 1],
    -0.0872664626,
    1.570796326795,
    0,
    "PIP_flex"
);
point_finger_flexion.add(PIP_flex);

var PIP = new Joint(
    [0.0005, -0.04826, 0.00799],
    [0, 0, 0],
    true
);

PIP.addMotion(PIP_flex);

var Iphalanx2 = new Bone("bones/_fingers3.asc", PIP, true, Iphalanx1, []);

var DIP_flex = new Motion(
    [0, 0, 1],
    -0.0872664626,
    1.570796326795,
    0,
    "DIP_flex"
);

var DIP = new Joint(
    [0.00193, -0.03277, 0.00472],
    [0, 0, 0],
    true
);
DIP.addMotion(DIP_flex);
point_finger_flexion.add(DIP_flex);


var Iphalanx3 = new Bone("bones/_fingers4.asc", DIP, true, Iphalanx2, []);

var CMC3 = new Joint(
    [-0.0047, -0.0085, -0.005],
    [0.0872664626, 0.174532925199, 0.0872664626],
    false
);

var CMC2 = new Joint(
    [-0.0047, -0.0095, -0.005],
    [0.174532925199, 0.261799387799, 0.0],
    false
);

var metacarpal3 = new Bone("bones/_fingers8.asc", CMC3, true, carp_metacarp, []);



var MCP3_1 = new Joint(
    [0.0, 0.0, 0.0],
    [0, 0, 0],
    false
);

var MCP3 = new Joint(
    [0.0, -0.003, 0.0],
    [0, 0, 0],
    true
);

var MCP3_flex = new Motion(
    [0, 0, 1],
    -0.174532925199,
    1.570796326795,
    0,
    "MCP3_flex"
);

MCP3.addMotion(MCP3_flex);

var midfinger3 = new Bone("bones/_fingers7.asc", MCP3, true, metacarpal3, []);

var midfinger1 = new Bone("bones/_fingers5.asc", MCP3_1, true, midfinger3, []);
var midfinger2 = new Bone("bones/_fingers6.asc", MCP3_1, true, midfinger3, []);

var CMC4 = new Joint(
    [-0.0047, -0.008, -0.0033],
    [0.0872664626, 0.174532925199, 0.0872664626],
    false
);

var metacarpal4 = new Bone("bones/_fingers12.asc", CMC4, true, carp_metacarp, []);

var MCP4 = new Joint(
    [0.0, -0.0025, 0.0],
    [0, 0, 0],
    false
);

var ringfinger1 = new Bone("bones/_fingers9.asc", MCP4, true, metacarpal4, []);
var ringfinger2 = new Bone("bones/_fingers10.asc", MCP4, true, metacarpal4, []);
var ringfinger3 = new Bone("bones/_fingers11.asc", MCP4, true, metacarpal4, []);

var CMC5 = new Joint(
    [-0.002, -0.01, 0.0035],
    [0.0872664626, 0.174532925199, 0.0872664626],
    false
);

var metacarpal5 = new Bone("bones/_fingers16.asc", CMC5, true, carp_metacarp, []);

var MCP5 = new Joint(
    [0.0, -0.002, 0.0],
    [0, 0, 0],
    false
);

var littlefinger1 = new Bone("bones/_fingers13.asc", MCP5, true, metacarpal5, []);
var littlefinger2 = new Bone("bones/_fingers14.asc", MCP5, true, metacarpal5, []);
var littlefinger3 = new Bone("bones/_fingers15.asc", MCP5, true, metacarpal5, []);


var thumb_abd = new Motion(
    [1, 0, 0],
    -0.785398163397,
    0.261799387799,
    0,
    "thumb_abd"
);

var thumb_flex = new Motion(
    [0.056398022307, 0.983577389037, -0.171449067814],
    -0.785398163397,
    1.570796326795,
    0,
    "thumb_flex"
);

var CMC1 = new Joint(
    [0.008, -0.0045, 0.0219],
    [0, 0, 0],
    true
);

CMC1.addMotion(thumb_abd);
CMC1.addMotion(thumb_flex);

var thumb = new Bone("bones/_fingers17.asc", CMC1, true, carp_metacarp, []);

var CMC1_1 = new Joint(
    [0, 0, 0],
    [0, 0, 0],
    false
);

var thumb_1 = new Bone("bones/_fingers18.asc", CMC1_1, true, thumb, []);
var thumb_2 = new Bone("bones/_fingers19.asc", CMC1_1, true, thumb, []);

*/

function initSlider(bone, num, numOM) {
    var div = document.createElement('div');
    div.id = bone.Joint.Motions[numOM].name;

    var header = document.createElement("p");
    header.innerHTML = bone.Joint.Motions[numOM].name;
    var c = document.getElementById("SmallMotions");
    c.appendChild(header);
    c.appendChild(div);


    $("#" + div.id).slider({
        min: bone.Joint.Motions[numOM].min,
        max: bone.Joint.Motions[numOM].max,
        step: 0.001,
        value: bone.Joint.Motions[numOM].cur_value,
        slide: function( event, ui ) {
            bone.Joint.Motions[numOM].cur_value = ui.value;
        }
    }).slider("float");

}

function initSliderForCompexMotion(Mot) {
    
    var div = document.createElement('div');
    div.id = Mot.name;

    var c = document.getElementById("ComplexMotions");
    var header = document.createElement("p");
    header.innerHTML = Mot.name;

    c.appendChild(header);
    c.appendChild(div);

    $("#" + div.id).slider({
        min: 0,
        max: 1,
        step: 0.001,
        slide: function( event, ui ) {
            var x1 = [];
            var y1 = [];
            var x2 = [];
            var y2 = [];
            var i;
            if (Mot.T < ui.value)
            {
                i = 0;
                for (; i < Mot.motions.length; ++i){
                    x1.push(Mot.T);
                    x2.push(1);
                    y1.push(Mot.motions[i].cur_value);
                    y2.push(Mot.motions[i].max);
                }
            }
            else
            {
                i = 0;
                for (; i < Mot.motions.length; ++i){
                    x1.push(0);
                    x2.push(Mot.T);
                    y1.push(Mot.motions[i].min);
                    y2.push(Mot.motions[i].cur_value);
                }

            }
            i = 0;
            for (; i < Mot.motions.length; ++i){
                Mot.motions[i].cur_value = Mot.linAppr(x1[i], y1[i], x2[i], y2[i], ui.value);
                $("#" + Mot.motions[i].name).slider("value", Mot.motions[i].cur_value);
            }
            Mot.T = ui.value;
        }
    }).slider("float");
    
}