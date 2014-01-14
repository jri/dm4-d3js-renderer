function D3View() {

    var svg
    var width, height

    this.display_topicmap = function(topicmap_viewmodel) {

        var topic_data = get_topic_data(topicmap_viewmodel)
        var assoc_data = get_assoc_data(topicmap_viewmodel)

        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(80)       // default is 20
            .size([width, height])
            .nodes(topic_data)
            .links(assoc_data)
            .on("start", function() {console.log("simulation started")})
            .on("end",   function() {console.log("simulation ended")})
            .on("tick",  function() {
                assocs
                    .attr("x1", function(d) {return d.source.x})
                    .attr("y1", function(d) {return d.source.y})
                    .attr("x2", function(d) {return d.target.x})
                    .attr("y2", function(d) {return d.target.y})
                topics
                    .attr("cx", function(d) {return d.x})
                    .attr("cy", function(d) {return d.y})
            })
            .start()

        var assocs = svg.selectAll(".assoc")
            .data(assoc_data)
            .enter().append("line")
                .attr("class", "assoc")

        var topics = svg.selectAll(".topic")
            .data(topic_data)
            .enter().append("circle")
                .attr("class", "topic")
                .attr("r", 8)
                .call(force.drag)

        topics.append("title").text(function(d) {return d.label})
    }

    this.init = function() {
        svg = d3.select(".topicmap-renderer").append("svg")
            .attr("width", width)
            .attr("height", height)
    }

    this.resize = function(size) {
        width = size.width
        height = size.height
    }

    // ----------------------------------------------------------------------------------------------- Private Functions

    function get_topic_data(topicmap_viewmodel) {
        var data = []
        topicmap_viewmodel.iterate_topics(function(topic) {
            // topic.fixed = true
            data.push(topic)
        })
        return data
    }

    function get_assoc_data(topicmap_viewmodel) {
        var data = []
        topicmap_viewmodel.iterate_associations(function(assoc) {
            data.push({
                source: assoc.get_topic_1(),
                target: assoc.get_topic_2()
            })
        })
        return data
    }
}
