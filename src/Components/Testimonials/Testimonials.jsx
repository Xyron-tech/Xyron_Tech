import { useEffect, useRef, useState } from "react";
import "./Testimonials.css";

const initialForm = {
  name: "",
  company: "",
  role: "",
  location: "",
  service: "",
  duration: "",
  website: "",
  instagram: "",
  message: "",
  consent: false,
};

const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreview, setAudioPreview] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [voiceFile, setVoiceFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  const sliderRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wheelLockRef = useRef(false);

  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    let active = true;
    fetch(`${apiBaseUrl}/testimonials`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Testimonials could not be loaded.");
        if (active) setTestimonials(data.testimonials || []);
      })
      .catch((error) => {
        if (active) setFormError(error.message || "Testimonials could not be loaded.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
  }, [audioPreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Choose a JPG, PNG, or WebP profile photo.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Profile photos must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setFormError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioPreview(audioUrl);
        setVoiceFile(new File([audioBlob], `testimonial-${Date.now()}.webm`, { type: audioBlob.type }));

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone error:", error);
      alert("Microphone permission kudunga machan.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.consent) {
      setFormError("Please confirm your consent before submitting.");
      return;
    }
    if (voiceFile?.size > 5 * 1024 * 1024) {
      setFormError("Voice recordings must be 5 MB or smaller.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormMessage("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, String(value)));
      if (photoFile) payload.append("photo", photoFile);
      if (voiceFile) payload.append("voice", voiceFile);

      const response = await fetch(`${apiBaseUrl}/testimonials`, { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Your testimonial could not be submitted.");

      setForm(initialForm);
      setPhotoFile(null);
      setPhotoPreview("");
      setVoiceFile(null);
      setAudioPreview("");
      setShowForm(false);
      setFormMessage(data.message || "Your experience was submitted for review.");

      setTimeout(() => {
        sliderRef.current?.scrollTo({ left: sliderRef.current.scrollWidth, behavior: "smooth" });
      }, 200);
    } catch (error) {
      setFormError(error.message || "Your testimonial could not be submitted. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardWidth = () => {
    const slider = sliderRef.current;

    if (!slider) return 0;

    const card = slider.querySelector(".testimonial-card");

    if (!card) return 0;

    const styles = window.getComputedStyle(slider);
    const gap = parseFloat(styles.columnGap || styles.gap || 0);

    return card.offsetWidth + gap;
  };

  const getMaxScroll = () => {
    const slider = sliderRef.current;

    if (!slider) return 0;

    return slider.scrollWidth - slider.clientWidth;
  };

  const isAtStart = () => {
    const slider = sliderRef.current;

    if (!slider) return true;

    return slider.scrollLeft <= 5;
  };

  const isAtEnd = () => {
    const slider = sliderRef.current;

    if (!slider) return true;

    return slider.scrollLeft >= getMaxScroll() - 5;
  };

  const moveSlider = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cardWidth = getCardWidth();

    if (!cardWidth) return;

    let target = slider.scrollLeft + direction * cardWidth;

    const maxScroll = getMaxScroll();

    if (target > maxScroll) {
      target = 0;
    }

    if (target < 0) {
      target = maxScroll;
    }

    slider.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  /*
    Mouse wheel horizontal control

    Down:
    card -> next card

    Last card + down:
    page continues down

    Up:
    previous card

    First card + up:
    page continues up
  */
  const handleWheel = (e) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const direction = e.deltaY > 0 ? 1 : -1;

    if (direction === 1 && isAtEnd()) {
      return;
    }

    if (direction === -1 && isAtStart()) {
      return;
    }

    e.preventDefault();

    if (wheelLockRef.current) return;

    wheelLockRef.current = true;

    moveSlider(direction);

    setTimeout(() => {
      wheelLockRef.current = false;
    }, 650);
  };

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    slider.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      slider.removeEventListener("wheel", handleWheel);
    };
  }, [testimonials]);

  /*
    Auto slider
  */
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      const slider = sliderRef.current;

      if (!slider) return;

      const cardWidth = getCardWidth();

      if (!cardWidth) return;

      const maxScroll = getMaxScroll();

      if (slider.scrollLeft >= maxScroll - 5) {
        slider.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        slider.scrollBy({
          left: cardWidth,
          behavior: "smooth",
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [testimonials]);

  /*
    Drag support
  */
  const handlePointerDown = (e) => {
    const slider = sliderRef.current;

    if (!slider) return;

    isDragging.current = true;
    dragStartX.current = e.clientX;

    slider.setPointerCapture?.(e.pointerId);
    slider.classList.add("is-dragging");
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;

    const slider = sliderRef.current;

    if (!slider) return;

    const currentX = e.clientX;
    const difference = dragStartX.current - currentX;

    slider.scrollLeft += difference;
    dragStartX.current = currentX;
  };

  const handlePointerUp = () => {
    isDragging.current = false;

    if (sliderRef.current) {
      sliderRef.current.classList.remove("is-dragging");
    }
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "C";
  };

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-container">

        {/* Header */}
        <div className="testimonials-header">
          <span className="section-mini-title">
            CLIENT EXPERIENCES
          </span>

          <h2>
            What Our <span>Clients Say</span>
          </h2>

          <p>
            Real experiences from businesses and brands we've worked with.
          </p>
        </div>

        {formMessage && <p className="testimonial-feedback success" role="status">{formMessage}</p>}
        {formError && !showForm && <p className="testimonial-feedback error" role="alert">{formError}</p>}

        {/* Cards */}
        {testimonials.length > 0 ? (
          <div className="testimonial-slider-wrapper">

            <button
              className="slider-arrow slider-arrow-left"
              onClick={() => moveSlider(-1)}
              aria-label="Previous testimonial"
            >
              ←
            </button>

            <div
              className="testimonial-slider"
              ref={sliderRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {testimonials.map((testimonial) => (
                <article
                  className="testimonial-card"
                  key={testimonial.id}
                >
                  {/* Profile */}
                  <div className="testimonial-profile-center">

                    <div className="profile-photo-wrap">
                      {testimonial.photo ? (
                        <img
                          src={testimonial.photo}
                          alt={testimonial.name}
                          className="testimonial-photo"
                        />
                      ) : (
                        <div className="testimonial-photo-placeholder">
                          {getInitial(testimonial.name)}
                        </div>
                      )}

                      <span className="profile-online-dot"></span>
                    </div>

                    <div className="testimonial-name-row">
                      <h3>{testimonial.name}</h3>

                      {testimonial.verified && (
                        <span className="verified-badge">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    {(testimonial.role || testimonial.company) && (
                      <p className="testimonial-role">
                        {testimonial.role}

                        {testimonial.role && testimonial.company && (
                          <span> • </span>
                        )}

                        {testimonial.company}
                      </p>
                    )}

                    {testimonial.location && (
                      <p className="testimonial-location">
                        📍 {testimonial.location}
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="testimonial-meta">
                    {testimonial.service && (
                      <span className="service-badge">
                        {testimonial.service}
                      </span>
                    )}

                    {testimonial.duration && (
                      <span className="duration-badge">
                        {testimonial.duration}
                      </span>
                    )}
                  </div>

                  {/* Quote */}
                  <div className="testimonial-quote">
                    “
                  </div>

                  {/* Message */}
                  <p className="testimonial-message">
                    {testimonial.message}
                  </p>

                  {/* Voice */}
                  {testimonial.voice && (
                    <div className="testimonial-voice">
                      <div className="voice-label">
                        🎙️ Voice Feedback
                      </div>

                      <audio
                        controls
                        src={testimonial.voice}
                      />
                    </div>
                  )}

                  {/* Links */}
                  {(testimonial.website ||
                    testimonial.instagram) && (
                    <div className="testimonial-links">

                      {testimonial.website && (
                        <a
                          href={testimonial.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🌐 Website
                        </a>
                      )}

                      {testimonial.instagram && (
                        <a
                          href={testimonial.instagram}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📸 Instagram
                        </a>
                      )}

                    </div>
                  )}

                  {/* Footer */}
                  <div className="testimonial-footer">
                    <span>Client Experience</span>
                    <strong>XYRON WebTech</strong>
                  </div>

                  <div className="testimonial-bottom-line"></div>
                </article>
              ))}
            </div>

            <button
              className="slider-arrow slider-arrow-right"
              onClick={() => moveSlider(1)}
              aria-label="Next testimonial"
            >
              →
            </button>

          </div>
        ) : (
          <div className="testimonial-empty">
            <div className="empty-icon">💬</div>

            <h3>Be Our First Client Story</h3>

            <p>
              Share your experience and help future clients
              understand what it is like to work with us.
            </p>
          </div>
        )}

        {/* Share Button */}
        <div className="testimonial-share">
          <button
            className="share-testimonial-btn"
            onClick={() => setShowForm(true)}
          >
            <span>✦</span>
            Share Your Experience
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="testimonial-form-overlay">
            <div className="testimonial-form-card">

              <button
                className="form-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>

              <div className="form-heading">
                <span>CLIENT STORY</span>

                <h3>Share Your Experience</h3>

                <p>
                  Your feedback helps other clients trust our work.
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Name <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Company / Brand</label>

                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>

                    <input
                      type="text"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      placeholder="Founder / Owner / Manager"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>

                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Chennai, Tamil Nadu"
                    />
                  </div>

                  <div className="form-group">
                    <label>Service Used</label>

                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select service
                      </option>

                      <option value="Website Development">
                        Website Development
                      </option>

                      <option value="Web Application">
                        Web Application
                      </option>

                      <option value="E-Commerce Website">
                        E-Commerce Website
                      </option>

                      <option value="Mobile App">
                        Mobile App
                      </option>

                      <option value="Social Media Growth">
                        Social Media Growth
                      </option>

                      <option value="Video Editing">
                        Video Editing
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Project Duration</label>

                    <input
                      type="text"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="2 Weeks"
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>

                    <input
                      type="url"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Instagram</label>

                    <input
                      type="url"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                </div>

                {/* Photo */}
                <div className="form-group">
                  <label>Profile Photo</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />

                  {photoPreview && (
                    <div className="upload-preview">
                      <img
                        src={photoPreview}
                        alt="Preview"
                      />
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="form-group">
                  <label>
                    Your Feedback <span>*</span>
                  </label>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your experience..."
                    rows="5"
                    required
                  />
                </div>

                {/* Voice */}
                <div className="voice-record-section">

                  <label>Voice Feedback</label>

                  <div className="voice-controls">

                    {!isRecording ? (
                      <button
                        type="button"
                        className="record-btn"
                        onClick={startRecording}
                      >
                        🎙️ Record Voice
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="record-btn recording"
                        onClick={stopRecording}
                      >
                        ⏹ Stop Recording
                      </button>
                    )}

                  </div>

                  {audioPreview && (
                    <audio
                      controls
                      src={audioPreview}
                      className="recorded-audio"
                    />
                  )}

                </div>

                {/* Consent */}
                <label className="consent-row">

                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                  />

                  <span>
                    I agree to let Xyron WebTech display
                    my testimonial publicly.
                  </span>

                </label>

                <button
                  type="submit"
                  className="submit-testimonial-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting…" : "Submit Experience"}
                </button>
                {formError && <p className="testimonial-feedback error" role="alert">{formError}</p>}
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;