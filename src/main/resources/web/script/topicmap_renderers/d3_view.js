function D3View() {

    // Viewmodel
    var topicmap            // the viewmodel underlying this view (a TopicmapViewmodel)

    // View
    var svg
    var width, height

    var force
    var nodes, links
    var topics, assocs

    // ------------------------------------------------------------------------------------------------------ Public API

    this.display_topicmap = function(topicmap_viewmodel) {

        topicmap = topicmap_viewmodel

        force = d3.layout.force()
            .charge(-120)
            .linkDistance(80)       // default is 20
            .size([width, height])
            .nodes(get_topic_data(topicmap))
            .links(get_assoc_data(topicmap))
            .on("start", function() {console.log("simulation started")})
            .on("end",   function() {console.log("simulation ended")})
            .on("tick",  function() {
                topics
                    .attr("cx", function(d) {return d.x})
                    .attr("cy", function(d) {return d.y})
                assocs
                    .attr("x1", function(d) {return d.source.x})
                    .attr("y1", function(d) {return d.source.y})
                    .attr("x2", function(d) {return d.target.x})
                    .attr("y2", function(d) {return d.target.y})
            })

        nodes = force.nodes()
        links = force.links()
        topics = svg.selectAll(".topic")
        assocs = svg.selectAll(".assoc")

        restart()
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

    // ---

    /**
     * @param   topic   A TopicViewmodel.
     */
    this.show_topic = function(topic) {
        nodes.push(topic)
        restart()
    }

    this.set_topic_selection = function(topic_id) {
        update_selection_dom(topic_id)
    }

    this.init_topic_position = function(topic) {
        if (topic.x == undefined || topic.y == undefined) {
            var pos = random_position()
            topic.x = pos.x
            topic.y = pos.y
        }
    }

    // ----------------------------------------------------------------------------------------------- Private Functions

    // === Force Simulation ===

    function restart() {

        assocs = assocs.data(links)
        assocs.enter().append("line")
            .attr("class", "assoc")

        topics = topics.data(nodes)
        topics.enter().append("circle")
            .attr("class", "topic")
            .attr("r", 8)
            .attr("data-topic-id", function(d) {return d.id})
            .call(force.drag)
            .on("click", click)
            .append("title").text(function(d) {return d.label})

        force.start()
    }

    // ---

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

    // ===

    function click(d) {
        dm4c.do_select_topic(d.id)
    }

    // ===

    function update_selection_dom(topic_id) {
        remove_selection_dom()                                                              // remove former selection
        d3.select(".topic[data-topic-id=\"" + topic_id + "\"]").classed("selected", true)   // set new selection
        // ### get_topic(topic_id).dom.addClass("selected")    
    }

    function remove_selection_dom() {
        d3.select("#topicmap-panel .topic.selected").classed("selected", false)
        // Note: the topicmap viewmodel selection is already updated. So we can't get the formerly
        // selected topic ID and can't use get_topic(). So we do DOM traversal instead.
        // ### TODO: consider equipping the canvas view with a selection model.
    }

    // ---

    // ### TODO: copy in canvas_view.js
    function random_position() {
        return {
            x: width  * Math.random() - topicmap.trans_x,
            y: height * Math.random() - topicmap.trans_y
        }
    }
}
