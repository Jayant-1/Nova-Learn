from flask import Flask, request, render_template, jsonify, redirect, url_for
from markupsafe import Markup  # Import Markup from markupsafe instead of flask
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import os
import markdown
import socket

# Create the templates directory if it doesn't exist
templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
if not os.path.exists(templates_dir):
    os.makedirs(templates_dir)

# Initialize Flask app
app = Flask(__name__, static_folder='static')

# Load environment variables (e.g., GOOGLE_API_KEY)
load_dotenv()

# Ensure API key is available
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

# Define the prompt template
PROMPT_TEMPLATE = """ 
Subject: {text_content}

You are an expert in generating roadmaps for {text_content}. 
Create a comprehensive roadmap for learning {text_content} from zero prior knowledge, aiming to reach an intermediate level of proficiency suitable for practical use (e.g., building basic projects, understanding core concepts, applying skills creatively). Include the following:  
- Monthly milestones with specific, beginner-friendly outcomes (e.g., 'Write a simple script,' 'Explain Newton's laws').  
- Detailed tasks per month, including foundational learning, hands-on practice, and small projects, with estimated time commitments (assume 10-15 hours/week).  
- Introduction of key concepts, tools, or techniques gradually, building from basics to intermediate topics (e.g., variables to functions in coding, lines to composition in art).  
- Curated, beginner-accessible resources (e.g., free tutorials, introductory books, videos) emphasizing clarity and engagement.  
- Common beginner challenges (e.g., information overload, lack of confidence) and practical mitigation strategies (e.g., spaced repetition, community support).  
- A final mini-project or demonstration of skill (e.g., a portfolio piece, a solved problem set) with clear completion criteria. 
- GIVE YOUTUBE VIDEO LINK FOR EVERY CONCEPT. 
Present the roadmap in a structured Markdown format with headings, bullet points, and a timeline. Ensure the plan is approachable, builds confidence incrementally, and aligns with modern standards or best practices in the subject. State any assumptions (e.g., subject choice) and allow for customization if provided.
"""

# Create the PromptTemplate
prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["text_content"],
)

# Function to generate roadmap
def generate(text_content):
    # Initialize the Google Generative AI model
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        google_api_key=api_key,  # Explicitly pass the API key
        temperature=0,  # Low temperature for structured output
        max_output_tokens=4096,  # Increased token limit for more comprehensive roadmaps
        timeout=60,  # Increased timeout for complex responses
        max_retries=3,  # Increased retries for better reliability
    )
    
    # Create an LLMChain with the prompt and model
    chain = LLMChain(llm=llm, prompt=prompt)
    
    # Run the chain with the input subject
    try:
        response = chain.invoke({"text_content": text_content})
        return response["text"]  # Extract text from the response dictionary
    except Exception as e:
        return f"Error generating roadmap: {str(e)}"

# Custom function to convert markdown to HTML
def md_to_html(text):
    try:
        # Convert markdown to HTML
        return Markup(markdown.markdown(text))
    except Exception as e:
        # Fall back to preformatted text if there's any issue
        return Markup(f"<pre>{text}</pre>")

# Register filter with Jinja
app.jinja_env.filters['md_to_html'] = md_to_html

# Route for the homepage with form (original index.html)
@app.route('/results', methods=['GET', 'POST'])
def results():
    roadmap = None
    error = None
    subject = None
    
    if request.method == 'POST':
        # Get the subject from the form
        text_content = request.form.get('text_content')
        subject = text_content  # Store for displaying back to the user
        
        if text_content:
            try:
                # Generate the roadmap
                roadmap = generate(text_content)
                if roadmap.startswith("Error"):
                    error = roadmap
                    roadmap = None
            except Exception as e:
                error = f"Application error: {str(e)}"
        else:
            error = "Please enter a subject for the roadmap"
            
    return render_template('index.html', roadmap=roadmap, error=error, subject=subject)

# Main route for the landing page (main.html)
@app.route('/', methods=['GET'])
def main():
    return render_template('main.html')

# API endpoint to handle the search from main.html
@app.route('/api/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    # Redirect to results page with the query
    return jsonify({"redirect": f"/results?query={query}"})

# Route to handle the form submission from main.html
@app.route('/generate', methods=['POST'])
def generate_from_main():
    query = request.form.get('promptInput')
    
    if not query:
        return redirect('/')
    
    try:
        # Generate the roadmap
        roadmap = generate(query)
        if roadmap.startswith("Error"):
            error = roadmap
            roadmap = None
        else:
            error = None
    except Exception as e:
        error = f"Application error: {str(e)}"
        roadmap = None
        
    return render_template('index.html', roadmap=roadmap, error=error, subject=query)

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

# Get the local IP address
def get_local_ip():
    try:
        # Create a socket connection to an external server
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Google's DNS server
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"  # Fallback to localhost

# Run the Flask app
if __name__ == '__main__':
    # Move the templates to the right location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check if templates directory exists, create if not
    templates_dir = os.path.join(current_dir, "templates")
    if not os.path.exists(templates_dir):
        os.makedirs(templates_dir)
    
    # Ensure main.html is in the templates directory
    main_source = os.path.join(current_dir, "main.html")
    main_dest = os.path.join(templates_dir, "main.html")
    if os.path.exists(main_source) and not os.path.exists(main_dest):
        import shutil
        shutil.copy(main_source, main_dest)
    
    # Ensure index.html is in the templates directory
    index_source = os.path.join(current_dir, "index.html")
    index_dest = os.path.join(templates_dir, "index.html")
    if os.path.exists(index_source) and not os.path.exists(index_dest):
        import shutil
        shutil.copy(index_source, index_dest)
    
    # Create static directory for CSS, JS, and images
    static_dir = os.path.join(current_dir, "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
        
    # Create subdirectories in static
    for subdir in ['css', 'js', 'Img']:
        subdir_path = os.path.join(static_dir, subdir)
        if not os.path.exists(subdir_path):
            os.makedirs(subdir_path)
    
    # Get the local IP address
    local_ip = get_local_ip()
    port = 5000
    
    print(f"Starting server...")
    print(f"Access the application on this device at: http://127.0.0.1:{port}")
    print(f"Access from other devices on your network at: http://{local_ip}:{port}")
    
    # Run the Flask app on all network interfaces (0.0.0.0)
    app.run(host='0.0.0.0', port=port, debug=True)