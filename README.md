# Post-Disaster Visualization Dashboard
## VAST 2019 Mini Challenge 3: Voice from the People


The VAST Challenge 2019 presents three mini-challenges and a grand challenge for applying visual analytics research and technologies to help a city grapple with the aftermath of an earthquake that damages their nuclear power plant.

In disasters, people reach out to friends and family to check in and discuss what they see happening around them. The city and its emergency response teams are hoping to gain an understanding of the issues facing the citizenry through the social media posts, helping guide them into an information source as to where to focus efforts and what the concerns of the populace are.

## Installation

We have developed the visualizations using D3.js and web programming languages like HTML5, CSS and JavaScript.
In order to run the visualizations your require the following:
- A JavaScript enabled web browser.
- A web server.

### Web Browser
D3.js works on all the browsers except IE8 and lower.

### Web Server
Most browsers serve local HTML files directly from the local file system. However, there are certain restrictions when it comes to loading external data files. As, we will be loading data from external files like CSV. We need to set up a web server right.

Any web server works well with our code. We have used python http server on development. While, inside the directory, please run the following command. 
```bash
npm install http-server
python -m http.server 8000
```

Use a JS enabled web browser with localhost (http://localhost:8000/) to run the visualizations.


## Directory Structure
The Preprocessed data is updated completely into github repository. The following is the directory structure.
 
1. Post-Disaster-Visualization-Dashboard/ - It's the root folder which has all the files.\
2. Post-Disaster-Visualization-Dashboard/index.html - Html file which is needed to be run. \
3. Post-Disaster-Visualization-Dashboard/scripts/index.js - The js file which has the complete d3 code to develop visualization \
4. Post-Disaster-Visualization-Dashboard/CSS/style.css - The styling code is present in this file.\
5. Post-Disaster-Visualization-Dashboard/Data/* - The preprocessed data which is read by the js scripts.\
6. Post-Disaster-Visualization-Dashboard/Images/* - The image files necessary to represent the visualizations.\
7. Post-Disaster-Visualization-Dashboard/preprocessing/* - The preprocessing scripts used to generate derived attributes.
