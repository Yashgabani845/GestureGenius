from gtts import gTTS
import os

def text_to_speech(text, language='en', output_file='output.mp3'):
    try:
        tts = gTTS(text=text, lang=language, slow=False)
        
        tts.save(output_file)
        
        # os.system(f"start {output_file}")  # Windows
        # os.system(f"afplay {output_file}")  # Mac
        # os.system(f"mpg321 {output_file}")  # Linux
        
        print(f"Audio saved as {output_file}")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")

text = "Hello! This is a test of text to speech conversion using gTTS."
text_to_speech(text)