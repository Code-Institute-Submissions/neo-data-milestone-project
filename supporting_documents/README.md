# Near Earth Object Data Visualisation: Milestone Project 2
    
<p style="text-align: justify;">
This project provides a data dashboard of the Near Earth objects (NEO's) undertaking close approaches to Earth in a specified time period. 
Data is obtained from a NASA API (<a target="_blank" href = "https://api.nasa.gov/neo/?api_key=DEMO_KEY" style ="text-decoration: none;"> NeoW </a>)
which provides NEO information over a maximum 7 day period. This data dashboard obtains the data from the API; extracts the relevent data; post processes this data; and provides a visualisation of the NEO objects' 
date of close approach; estimated diameter; Earth miss distance at its point of closest approach; and the potential hazard of these NEO's to Earth.
</p> 
<p style="text-align: justify;">
This data dashboard is aimed at the scientific community and can be utilised by astronomers to identify opportunities to view NEOs on a specific date; it could also be utilised by engineers planning space missions
to a NEO and would allow a range of suitable targets to be identified for a specified launch date.
</p>   
    
    
    One or two paragraphs providing an overview of your project.
    Essentially, this part is your sales pitch.

## User Experience Design

<p style="text-align: justify;">
Use this section to provide insight into your UX process, focusing on who this website is for, what it is that they want to achieve and how your project is the best way to help them achieve these things.
</p>

### User Stories

<p style="text-align: justify;">
In particular, as part of this section we recommend that you provide a list of User Stories, with the following general structure:
    As a user type, I want to perform an action, so that I can achieve a goal.
 </p>   
 
### Wireframes/mockups

<p style="text-align: justify;">
This section is also where you would share links to any wireframes, mockups, diagrams etc. that you created as part of the design process. These files should themselves either be included in the project itself (in an separate directory), or just hosted elsewhere online and can be in any format that is viewable inside the browser.
</p>

## Features

<p style="text-align: justify;">
In this section, you should go over the different parts of your project, and describe each in a sentence or so.
</p>

#### Background image

<p style="text-align: justify;">
A background image of space is used to fill the entire page area and is used to border the content display area when margins are applied to it and to provide space themed imagery prior to data output generation.
</p>


#### Content display area

<p style="text-align: justify;">
The content display area is a 'div' element which contains all the content to be displayed to the page user. At smaller screen resolutions, 991px screen resolutions and below, 
the content display area fills 100% of the screen width. At screen resolutions at 992px and above a left and right margin is applied to the content display area to allow the backgorund image to border the content display area.
</p>

#### Site title

<p style="text-align: justify;">
The site title is generated as a part of the bootstrap grid system and is contained with a div  of class 'col-12' to ensure that it takes up the full width of the screen.
</p>

#### NEO search date 

<p style="text-align: justify;">
In this section the user is given information on the purpose of the site. In addition to this, there is an input area to enter a start date for the NEO search and there are buttons which:
</p>

* start the NEO search
* change start date to the previous week
* change start date to the following week

</p>

#### html

<p style="text-align: justify;">
The search input area uses the bootstrap grid system to maintain layout over the full range of screen resolutions. The area is separated into two columns each with a width of 12. 
The first column contains a ‘p’ element which contains the descriptive text for the website. Additionally, it contains an input box for the user to select a date to begin a NEO search. Upon focus, the input box will display a calendar which allows a date to be selected or alternatively a date can be manually entered.
The second column contains the buttons used to begin the search or to change the date in the input box to the previous or following weeks.
If no date is selected within the input box and one of the buttons is pressed: the input box will display the text: ‘Please enter a date’.
</p>

#### css

<p style="text-align: justify;">
Media queries are used to alter the font size of the text throughout this section dependent upon the screen resolution it is being viewed on. 
</p>

### Javascript: main.js

#### Datepicker 

<p style="text-align: justify;">
A datepicker function [ref 1] is used to generate the calendar for date selection. This function is called when the html date selection input box is activated. The date format used
is YYYY-MM-DD.
</p>

#### JQuery event handling 

<p style="text-align: justify;">
A JQuery event handler is used to add a class to the calendar modal box when focus is activated on the input box. This class styles the background of the calendar. 
</p>

<p style="text-align: justify;">
The 'previous week', 'start search' and 'next week' buttons are used as JQuery selectors with attached event handler functions and additional coding for incorrect inputs.
If an incorrect date is entered, or the date input field is empty, and any of the buttons are activated the following text is displayed in the input box: 'Please enter a date'. 
In addition to this, user feedback for the buttons is provided by mouseenter and mouseleave events triggering a change in button text colour.
</p>

<p style="text-align: justify;">
Once a valid start date has been entered the id of the html button element is obtained and this is passed as an argument into the main data generation function called 'neo_search_period'.
</p>

<p style="text-align: justify;">
Finally, upon activation of the 'start search button' with a suitable search date, a two second delay is activated to allow the plots to be generated then the class which is hiding 
the data output area is removed revealing the generated data output. 
</p>

#### Function: neo_search_period (argument 1)

<p style="text-align: justify;">
Once the 'neo_search_period' function has been called the function reads the start date from the html input box and from this creates a new Date() object instance. 
One of three actions, based upon the html button id of the input argument of the function and the use an IF statement, is then performed.
</p>

##### Start-search: server request construction

<p style="text-align: justify;">
If the 'start search' button has been selected the function creates a second Date() object instance which is seven days greater than the starting date. This new date, 
or search end date, is used as an input argument to the 'date_format' function [REF 2] which formats the date in the form YYYY-MM-DD. The start and end dates generated 
are then used as inputs for the construction of the data request to be sent to the API server. Once the server request function is constructed, 
the 'retrieve_asteroid_data' function is called with the server request being the first of its three input arguments.
</p>

##### Previous week start date

<p style="text-align: justify;">
If the 'previous week' button has been selected a second Date() object instance is created which is 8 days prior to the start date of the html input box. The 'date_format'
function is again utilised to format the date and this is then written to the html input box.
</p>

##### Next week start date

<p style="text-align: justify;">
If the 'next week' button has been selected a second Date() object instance is created which is 8 days after the start date of the html input box. The 'date_format'
function is again utilised to format the date and this is then written to the html input box.
</p>

#### Function: retrieve_asteroid_data (argument 1, argument 2, argument 3)

<p style="text-align: justify;">
 When called, with the required three arguments, this function will contact the API server using the previously constructed server request from the first input argument.
 A new XMLHttpRequest is created and a 'GET' request to retrieve the object for the specified time period is sent to the server. Once the request has been processed by the 
 server and the response is ready; a callback function data_create(), which is the second input argument to this function, is called with the server response as its input argument. 
 This function is used to select information of interest from the returned object. Finally, a second callback function, print(), is called which is the third input argument to this 
 function and is used to generate the data visualisations for the dashboard.
 </p>

#### Function: data_extraction (argument 1)

<p style="text-align: justify;">
This function is passed as the second argument when the 'retrieve_asteroid_data' function is called. The data received from the server is used as its input argument and
using the object keys of the data received, data for each individual NEO object is obtained. An empty object is created for each NEO object and the relevant data for the
NEO object is added to create a new object with only the required information. Each new object created is pushed to an array which, when populated for each NEO object,
is used as the data for the visualisation.
</p>

#### Function: plot_create ( )

<p style="text-align: justify;">
This function is called as the third input argument to the 'retrieve_asteroid_data' function. This function creates a crossfilter for the data using the array created by the 
'data_extraction' function. The variable names for each of the data plots are then defined externally to the chart generation functions so that they can be accessed at a global 
level and are accessible to reset calls. The functions containing the plot generation code are then called using the crossfilter data and the variable names for the input data 
plots as the two input arguments. Finally, the call to render all data plots is implemented.
</p>

#### Function: miss_distance(argument 1, argument 2, argument 3)

<p style="text-align: justify;">
This function is used to group the data based on the Earth miss distance of the NEO. The function has three input arguments, the first is the dimension about which to 
group the data. The second is the minimum value of the miss distance and the third argument is the maximum value of the miss distance. The latter two input arguments are used to 
create lower and upper boundaries for the miss distance data. When the function is called the total number of NEO objects within the specified miss distance boundaries is returned.
</p>

#### Function: estimated_diameter (argument 1, argument 2, argument 3)

<p style="text-align: justify;">
This function is used to group the data based on the estimated maximum diameter of the NEO. The function has three input arguments, the first is the dimension about which to 
group the data. The second is the minimum value of the estimated diameter and the third argument is its maximum value. The latter two input arguments are used to 
create lower and upper boundaries for thedata. When the function is called the total number of NEO objects within the specified estimated maximum diameter boundaries is returned.
</p>

#### Function: number_hazardous_objects (argument 1, argument 2)

<p style="text-align: justify;">
This function creates a composite line plot using the crossfilter data as the first argument and the chart variable name as its second argument. The dates for the NEO search are parsed
to ensure they are in the correct format for the software to understand. The date dimension is then created for the plot using these parsed dates. The top and bottom rows of the parsed date array 
are then extracted and are used to create the domain for the chart. 
</p>

<p style="text-align: justify;">
This composite chart consists of four groups with the date the dimension for each one. The first of which is the total number of NEO's for a 
specific date. This is calculated using anonymous functions to return the daily total. The second group is a count of the total number of potentially hazardous NEOs for a particular date. This total is obtained using
an IF statement which only adds to the total if the value is equal to 'true'. The third group is a count of the total number of NEOs on that date which have an Earth miss distance less than 10 million km. This is obtained by 
calling the miss_distance function which the correct input arguments. Finally, the fourth group is a count of the total number of NEOs with an estimated maximum diameter greater than 2km. This total is obtained by
calling the estimated_diameter function with the correct arguments.
</p>

#### Function: close_approach_stack (argument 1, argument 2)

<p style="text-align: justify;">
This function creates a stacked bar chart using the crossfilter data as the first argument and the chart variable name as its second argument. The dimension used for this chart are the 
close approach dates extracted directly from the crossfilter. The group used for the chart is obtained by using the miss_distance function with correct arguments and produces a count of the number of NEOs with
a miss distance less than 10 million km. The two stacks are miss distance between 10 and 50 million km and a miss distance of 50 million km and above. The object count for the stacked portions of the chart are obtained 
by calling the miss_distance function with the correct input arguments.
</p>

#### Function: estimated_diameter_stack (argument 1, argument 2)

<p style="text-align: justify;">
This function creates a stacked bar chart using the crossfilter data as the first argument and the chart variable name as its second argument. The dimension used for this chart are the 
close approach dates extracted directly from the crossfilter. The group used for the chart is obtained by using the estimated_diameter function with correct arguments and produces a count of the number of NEOs with
an estimated maximum diameter less than 1 km. The two stacks are an estimated maximum diameter between 1 and 2 km and an estimated maximum diameter of 2 km and above. The object count for the stacked portions of the chart are obtained 
by calling the estimated_diameter function with the correct input arguments.
</p>

#### Function: estimated_diameter_stack (argument 1, argument 2)

<p style="text-align: justify;">
This function creates a pie chart using the crossfilter data as the first argument and the chart variable name as its second argument. The dimension is created using an IF statement which returns 'YES' if the
potential hazard to Earth's object value is 'true', otherwise the statement returns 'NO'. The returned values are then used as the group for the pie chart.
</p>

#### Function: neo_count (argument 1, argument 2)

<p style="text-align: justify;">
This function creates a count of the total number of objects filtered and the total number of objects counted and was obtained using the code found here [ref 2]. 
The function is called using the crossfilter data as the first argument and the chart variable name as its second argument.
</p>

#### Function: neo_data_table (argument 1, argument 2)

<p style="text-align: justify;">
This function creates a table of NEOs with the ten closest approach distances and was obtained using the code found here [ref 3].
The function is called using the crossfilter data as the first argument and the chart variable name as its second argument.
</p>

### Data Output

<p style="text-align: justify;"></p>


### Existing Features
    Feature 1 - allows users X to achieve Y, by having them fill out Z
    Feature 2 - fdd
    ...
    For some/all of your features, you may choose to reference the specific project files that implement them, although this is entirely optional.
    In addition, you may also use this section to discuss plans for additional features to be implemented in the future:

### Features Left to Implement
    Another feature idea
    
    error handling for incorrect number format in date field

## Technologies Used
In this section, you should mention all of the languages, frameworks, libraries, and any other tools that you have used to construct this project. For each, provide its name, a link to its official site and a short sentence of why it was used.

### JQuery
        The project uses JQuery to simplify DOM manipulation.
### dc.js

### d3

### Bootstrap

### scss


## Code Validation 

##  Testing
In this section, you need to convince the assessor that you have conducted enough testing to legitimately believe that the site works well. Essentially, in this part you will want to go over all of your user stories from the UX section and ensure that they all work as intended, with the project providing an easy and straightforward way for the users to achieve their goals.
Whenever it is feasible, prefer to automate your tests, and if you've done so, provide a brief explanation of your approach, link to the test file(s) and explain how to run them.
For any scenarios that have not been automated, test the user stories manually and provide as much detail as is relevant. A particularly useful form for describing your testing process is via scenarios, such as:
    Contact form:
        Go to the "Contact Us" page
        Try to submit the empty form and verify that an error message about the required fields appears
        Try to submit the form with an invalid email address and verify that a relevant error message appears
        Try to submit the form with all inputs valid and verify that a success message appears.
In addition, you should mention in this section how your project looks and works on different browsers and screen sizes.
You should also mention in this section any interesting bugs or problems you discovered during your testing, even if you haven't addressed them yet.
If this section grows too long, you may want to split it off into a separate file and link to it from here.

## Project Deployment 
This section should describe the process you went through to deploy the project to a hosting platform (e.g. GitHub Pages or Heroku).
In particular, you should provide all details of the differences between the deployed version and the development version, if any, including:
    Different values for environment variables (Heroku Config Vars)?
    Different configuration files?
    Separate git branch?
In addition, if it is not obvious, you should also describe how to run your code locally.

## References

### Media
The photos used in this site were obtained from ...

### Acknowledgements
I received inspiration for this project from X

## Credits

### Content
The text for section Y was copied from the Wikipedia article Z
    

The link below provides an official example of an expected structure for your readme file, that if followed in its entirety should get you 4 marks out of 5 on the assessment. To get the maximum 5 marks, you would need to include all of the parts below and also tailor the readme to your own particular project, providing any additional relevant information useful to your users and other developers who may want to contribute to the project.
