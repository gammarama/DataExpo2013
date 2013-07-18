library(shiny)

dynMap <- function(inputoutputId) 
{
    div(id = inputoutputId, class="d3map")
}


# Define UI for application that plots random distributions 
shinyUI(pageWithSidebar(
    
    # Application title
    headerPanel("Data Expo 2013"),
    
    sidebarPanel(
        includeHTML("scripts/graph.js"),
        includeHTML("css/button_style.css"),
        checkboxInput("aggregate", "Aggregate all years", TRUE),
        conditionalPanel(
            condition = "input.aggregate == false",
            sliderInput("year", "Choose year:", 
                        min = 2008, max = 2010, value = 2008, step = 1,
                        format="####")
        )
    ),
    
    mainPanel(
        dynMap(inputoutputId = 'd3io')
    )
))
