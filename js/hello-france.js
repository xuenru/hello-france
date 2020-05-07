const w = 600; // width
const h = 600; // height
const p = 50; // padding
let dataset = [];

//Create SVG element
let svg = d3.select("body")
    .append("svg")
    .attr('width', w)
    .attr('height', h);


d3.tsv('data/france.tsv', (d, i) => {
    return {
        codePostal: +d["Postal Code"],
        inseeCode: +d.inseecode,
        place: d.place,
        longitude: +d.x,
        latitude: +d.y,
        population: +d.population,
        density: +d.density
    }
}).then((rows) => {
    // console.log(error, rows)
    console.log("loaded " + rows.length + " rows")
    if (rows.length > 0) {
        console.log("First Row: ", rows[0])
        console.log("Last Row: ", rows[rows.length - 1])
    }
    dataset = rows;
    draw();
});


function draw() {
    // scale x
    let x = d3.scaleLinear()
        .domain(d3.extent(dataset, (row) => row.longitude))
        .range([p, w - p]);

    // scale y
    let y = d3.scaleLinear()
        .domain(d3.extent(dataset, (row) => row.latitude))
        .range([h - p, p])

    // plot the points
    svg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('width', 1)
        .attr('height', 1)
        .attr('x', (d) => Number.isNaN(d.longitude) ? null : x(d.longitude))
        .attr('y', (d) => Number.isNaN(d.latitude) ? null : y(d.latitude));

    // x axis
    svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - p})`)
        .call(d3.axisBottom(x));

    // y axis
    svg.append("g")
        .attr('class', 'y-axis')
        .attr('transform', `translate(${p}, 0)`)
        .call(d3.axisLeft(y))

    // x axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", w - p)
        .attr("y", h - 10)
        .text("longitude");

    // y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", -p)
        .attr("y", p - 40)
        .text("latitude")
}
