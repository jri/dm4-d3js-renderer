function D3View() {

    // View
    var svg
    var width, height

    var force               // D3 force layout
    var nodes, links        // force layout model
    var topics, assocs      // force layout DOM

    var body = d3.select("body")[0][0]

    // Viewmodel
    var topicmap            // the viewmodel underlying this view (a TopicmapViewmodel)

    // Short-term interaction state
    var association_in_progress     // true while new association is drawn (boolean)
    var mousedown_on_canvas         // true while canvas click or canvas move (boolean)
    var action_topic                // the topic being selected/moved/associated (TopicViewmodel)
    var has_moved

    // ------------------------------------------------------------------------------------------------------ Public API

    this.display_topicmap = function(topicmap_viewmodel) {

        topicmap = topicmap_viewmodel

        force = d3.layout.force()
            .charge(-120)           // default is -30
            .linkDistance(80)       // default is 20
            .size([width, height])
            .nodes(get_nodes_data(topicmap))
            .links(get_links_data(topicmap))
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
            .on("mousedown", on_canvas_mousedown)
            .on("mouseup", on_canvas_mouseup)
            .on("mousemove", on_mousemove)
            .on("contextmenu", on_canvas_contextmenu)
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

    this.show_association = function(assoc) {
        links.push(link_data(assoc))
        restart()
    }

    // ---

    this.remove_topic = function(topic_id) {
        js.delete(nodes, function(topic) {
            return topic.id == topic_id
        })
        remove_selection_dom()      // Note: D3 might rebind the selected element to another TopicViemodel
        restart()
    }

    this.remove_association = function(assoc_id) {
        js.delete(links, function(assoc) {
            return assoc.id == assoc_id
        })
        remove_selection_dom()      // Note: D3 might rebind the selected element to another TopicViemodel
        restart()
    }

    // ---

    this.set_topic_selection = function(topic_id) {
        remove_selection_dom()                                  // remove former selection
        get_topic_dom(topic_id).classed("selected", true)       // set new selection
    }

    this.set_association_selection = function(assoc_id) {
        remove_selection_dom()                                  // remove former selection
        get_association_dom(assoc_id).classed("selected", true) // set new selection
    }

    this.reset_selection = function() {
        remove_selection_dom()                                  // remove former selection
    }

    // ---

    this.init_topic_position = function(topic) {
        if (topic.x == undefined || topic.y == undefined) {
            var pos = random_position()
            topic.x = pos.x
            topic.y = pos.y
        }
    }

    this.begin_association = function(topic_id, x, y) {
        association_in_progress = true
        action_topic = get_topic(topic_id)
        //
        set_drawing_cursor(true)
        svg.insert("line", ":first-child")
            .attr("class", "assoc in-progress")
            .attr("x1", action_topic.x)
            .attr("y1", action_topic.y)
            .attr("x2", x)
            .attr("y2", y)
    }

    // ----------------------------------------------------------------------------------------------- Private Functions



    // === Model ===

    function get_topic(id) {
        return get_topic_dom(id).data()[0]
    }

    function get_association(id) {
        return get_association_dom(id).data()[0]
    }



    // === Force Simulation ===

    function restart() {

        assocs = assocs.data(links)
        assocs.enter().insert("line", ":first-child")
            .attr("class", "assoc")
            .on("click", on_assoc_click)
            .on("contextmenu", on_assoc_contextmenu)
        assocs.attr("data-assoc-id", function(d) {return d.id})
        assocs.exit().remove()

        topics = topics.data(nodes)
        topics.enter().append("circle")
            .attr("class", "topic")
            .attr("r", 8)
            .call(force.drag)
            .on("mousedown", on_topic_mousedown)
            .on("mouseup", on_topic_mouseup)
            .on("contextmenu", on_topic_contextmenu)
            .append("title").text(function(d) {return d.label})
        topics.attr("data-topic-id", function(d) {return d.id})
        topics.exit().remove()

        force.start()
    }

    // ---

    function get_nodes_data(topicmap_viewmodel) {
        var data = []
        topicmap_viewmodel.iterate_topics(function(topic) {
            // topic.fixed = true
            data.push(topic)
        })
        return data
    }

    function get_links_data(topicmap_viewmodel) {
        var data = []
        topicmap_viewmodel.iterate_associations(function(assoc) {
            data.push(link_data(assoc))
        })
        return data
    }

    // ---

    function link_data(assoc) {
        return {
            id:     assoc.id,
            source: assoc.get_topic_1(),
            target: assoc.get_topic_2()
        }
    }



    // === Events Handling ===

    function on_topic_mousedown(topic) {
        has_moved = false               // ### TODO
        d3.event.stopPropagation()      // bubbling would reset the selection
    }

    function on_canvas_mousedown() {
        mousedown_on_canvas = true
    }

    function on_topic_mouseup(topic) {
        if (association_in_progress) {
            end_association_in_progress(topic)
        } else if (!has_moved) {        // ### TODO
            dm4c.do_select_topic(topic.id)
        }
    }

    function on_canvas_mouseup() {
        if (mousedown_on_canvas) {
            dm4c.page_panel.save()      // ### TODO: the renderer should not responsible for saving the panel
            dm4c.do_reset_selection()   // ### TODO: only reset selection if no canvas move was in progress
            mousedown_on_canvas = false
        }
    }

    function on_mousemove() {
        if (action_topic) {
            if (association_in_progress) {
                var pos = d3.mouse(svg[0][0])
                get_association_in_progress()
                    .attr("x2", pos[0])
                    .attr("y2", pos[1])
            }
        }
    }

    function on_assoc_click(assoc) {
        dm4c.do_select_association(assoc.id)
    }

    function on_topic_contextmenu(topic) {
        var pos = d3.mouse(body)
        dm4c.open_topic_contextmenu(topic.id, {x: pos[0], y: pos[1]})
        d3.event.preventDefault()       // suppress browser context menu
        d3.event.stopPropagation()      // bubbling would invoke canvas context menu
        // ### TODO: but without bubbling the topic context menu is closed prematurly on mouse up (see GUITookit Menu)
    }

    function on_assoc_contextmenu(assoc) {
        var pos = d3.mouse(body)
        dm4c.open_association_contextmenu(assoc.id, {x: pos[0], y: pos[1]})
        d3.event.preventDefault()       // suppress browser context menu
        d3.event.stopPropagation()      // bubbling would invoke canvas context menu
    }

    function on_canvas_contextmenu() {
        var body_pos = d3.mouse(body)
        var svg_pos = d3.mouse(svg[0][0])
        dm4c.open_canvas_contextmenu({x: body_pos[0], y: body_pos[1]}, {x: svg_pos[0], y: svg_pos[1]})
        d3.event.preventDefault()       // suppress browser context menu
    }

    // ---

    // ### TODO: principal copy in canvas_view.js
    function end_association_in_progress(topic) {
        association_in_progress = false
        // Note: dm4c.do_create_association() implies refresh(). So association_in_progress
        // is reset before. Otherwise the last drawn association state would stay on canvas.
        if (topic && topic.id != action_topic.id) {
            dm4c.do_create_association("dm4.core.association", action_topic.id, topic.id)
        } else {
            // ### refresh()   // remove incomplete association from canvas
        }
        //
        action_topic = null
        // render
        get_association_in_progress().remove()
        set_drawing_cursor(false)
    }

    // --- Cursor Shapes ---

    // ### TODO: principal copy in canvas_view.js
    function set_moving_cursor(flag) {
        d3.select(".topicmap-renderer").classed("moving", flag)
    }

    // ### TODO: principal copy in canvas_view.js
    function set_drawing_cursor(flag) {
        d3.select(".topicmap-renderer").classed("drawing-assoc", flag)
    }



    // === DOM Manipulation ===

    function get_topic_dom(id) {
        return d3.select(".topic[data-topic-id=\"" + id + "\"]")
    }

    function get_association_dom(id) {
        return d3.select(".assoc[data-assoc-id=\"" + id + "\"]")
    }

    // ---

    function remove_selection_dom() {
        d3.select("#topicmap-panel .selected").classed("selected", false)
    }

    function get_association_in_progress() {
        return d3.select(".assoc.in-progress")
    }



    // ===

    // ### TODO: copy in canvas_view.js
    function random_position() {
        return {
            x: width  * Math.random() - topicmap.trans_x,
            y: height * Math.random() - topicmap.trans_y
        }
    }
}
