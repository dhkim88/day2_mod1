from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class DiseaseSymptom(Base):
    __tablename__ = "disease_symptoms"

    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False, index=True)
    symptom_id = Column(Integer, ForeignKey("symptoms.id"), nullable=False, index=True)
    probability = Column(Float, nullable=False)  # 0.0 ~ 1.0
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    disease = relationship("Disease", back_populates="disease_symptoms")
    symptom = relationship("Symptom", back_populates="disease_symptoms")
