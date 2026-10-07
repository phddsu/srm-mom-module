package com.srm.phd.mom.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.srm.phd.mom.entity.MinutesOfMeeting;
import com.srm.phd.mom.entity.MomSignature;
import com.srm.phd.mom.repository.MomSignatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PdfService {

    private static final DeviceRgb SRM_BLUE = new DeviceRgb(11, 46, 122);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(240, 240, 240);
    private final ObjectMapper mapper = new ObjectMapper();
    private final MomSignatureRepository signatureRepository;

    public ByteArrayInputStream generateMomPdf(MinutesOfMeeting mom) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(30, 30, 30, 30);

            // ==================== HEADER WITH LOGO ====================
            Table header = new Table(UnitValue.createPercentArray(new float[]{30, 70})).useAllAvailableWidth();
            header.setBorder(Border.NO_BORDER);

            Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
            try {
                InputStream is = getClass().getClassLoader().getResourceAsStream("static/srm-logo.jpg");
                if (is != null) {
                    byte[] bytes = is.readAllBytes();
                    ImageData data = ImageDataFactory.create(bytes);
                    Image logo = new Image(data);
                    logo.setWidth(120);
                    logoCell.add(logo);
                } else {
                    logoCell.add(new Paragraph("SRM").setBold().setFontSize(24).setFontColor(SRM_BLUE));
                }
            } catch (Exception e) {
                logoCell.add(new Paragraph("SRM").setBold().setFontSize(24).setFontColor(SRM_BLUE));
            }
            header.addCell(logoCell);

            Cell titleCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
            titleCell.add(new Paragraph("SRM INSTITUTE OF SCIENCE AND TECHNOLOGY").setBold().setFontSize(12).setFontColor(SRM_BLUE).setMarginBottom(0));
            titleCell.add(new Paragraph("Directorate of Research").setFontSize(10).setFontColor(SRM_BLUE).setMarginTop(0).setMarginBottom(0));
            titleCell.add(new Paragraph("Monthly Progress Review of Full-Time Scholars").setItalic().setFontSize(9).setMarginTop(0));
            header.addCell(titleCell);

            doc.add(header);
            doc.add(new Paragraph().setBorderBottom(new SolidBorder(SRM_BLUE, 1.5f)).setMarginTop(6).setMarginBottom(10));

            // ==================== META ====================
            Table meta = new Table(UnitValue.createPercentArray(new float[]{30, 70})).useAllAvailableWidth();
            addMetaRow(meta, "MoM Number", mom.getMomNumber());
            addMetaRow(meta, "Status", String.valueOf(mom.getCurrentStatus()).replace("_", " "));
            addMetaRow(meta, "Stage", String.valueOf(mom.getCurrentStage()).replace("_", " "));
            if (mom.getPeriodYear() != null && mom.getPeriodMonth() != null) {
                addMetaRow(meta, "Period of Assessment", mom.getPeriodMonth() + "/" + mom.getPeriodYear());
            }
            if (mom.getSubmissionDate() != null) {
                addMetaRow(meta, "Submitted On", mom.getSubmissionDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            }
            doc.add(meta);
            doc.add(new Paragraph("\n"));

            // ==================== SECTION A ====================
            sectionTitle(doc, "A. SCHOLAR DETAILS");
            Table a = kvTable();
            kvRow(a, "1", "Name of Research Scholar", mom.getSectionAScholarName());
            kvRow(a, "2", "Date of Registration of PhD", str(mom.getSectionARegistrationDate()));
            kvRow(a, "3", "Session & Year", mom.getSectionASessionYear());
            kvRow(a, "4", "Name of Supervisor", mom.getSectionASupervisorName());
            kvRow(a, "5", "Name of Co-Supervisor", mom.getSectionACosupervisorName());
            kvRow(a, "6", "Department", mom.getSectionADepartment());
            kvRow(a, "7", "Scopus ID", mom.getSectionAScopusId());
            kvRow(a, "8", "ORCID ID", mom.getSectionAOrcidId());
            kvRow(a, "9", "Scopus linked to ORCID?", Boolean.TRUE.equals(mom.getSectionALinked()) ? "Yes" : "No");
            kvRow(a, "10", "Title of PhD Work", mom.getSectionAPhdTitle());
            kvRow(a, "11", "Receiving Funding/Stipend?", mom.getSectionAFunding());
            if ("YES".equalsIgnoreCase(str(mom.getSectionAFunding()))) {
                kvRow(a, "12", "JRF / SRF", mom.getSectionAJrfSrf());
                kvRow(a, "", "Project Title", mom.getSectionAProjectTitle());
                kvRow(a, "", "Funding Agency", mom.getSectionAFundingAgency());
                kvRow(a, "", "Principal Investigator", mom.getSectionAPiName());
            }
            doc.add(a);
            doc.add(new Paragraph("\n"));

            // ==================== SECTION B ====================
            sectionTitle(doc, "B. STATUS OF RESEARCH WORK");
            Table b = kvTable();
            kvRow(b, "13", "Course Work Completed", Boolean.TRUE.equals(mom.getSectionBCourseworkCompleted()) ? "Yes" : "No");
            kvRow(b, "", "No. of Course Works recommended by DAC", str(mom.getSectionBCourseworksRecommended()));
            doc.add(b);
            doc.add(new Paragraph("\n"));

            // ==================== C ====================
            sectionTitle(doc, "C. RESEARCH MILESTONES");
            doc.add(listTable(mom.getSectionCMilestones(),
                    new String[]{"Milestone", "Status", "Expected Completion Date"},
                    new float[]{50, 25, 25},
                    new String[]{"name", "status", "expectedCompletionDate"}));
            doc.add(new Paragraph("\n"));

            // ==================== D ====================
            sectionTitle(doc, "D. RESEARCH THROUGHPUTS");
            doc.add(listTable(mom.getSectionDThroughputs(),
                    new String[]{"Particulars", "Journal Type", "Count"},
                    new float[]{60, 25, 15},
                    new String[]{"particular", "journalType", "count"}));
            doc.add(new Paragraph("\n"));

            // ==================== E ====================
            sectionTitle(doc, "E. SKILLS ACQUIRED DURING THE PERIOD");
            doc.add(listTable(mom.getSectionESkills(),
                    new String[]{"Particulars", "Details"},
                    new float[]{35, 65},
                    new String[]{"skill", "details"}));
            doc.add(new Paragraph("\n"));

            // ==================== F ====================
            sectionTitle(doc, "F.1 CHALLENGES FACED");
            doc.add(listTable(mom.getSectionFChallenges(),
                    new String[]{"Area", "Description"},
                    new float[]{35, 65},
                    new String[]{"area", "description"}));
            doc.add(new Paragraph("\n"));

            sectionTitle(doc, "F.2 PARTICIPATION IN SCHOLARLY ACTIVITIES");
            doc.add(listTable(mom.getSectionFParticipation(),
                    new String[]{"Activity", "Details"},
                    new float[]{35, 65},
                    new String[]{"activity", "details"}));
            doc.add(new Paragraph("\n"));

            sectionTitle(doc, "F.3 ACTIVITIES PLANNED");
            doc.add(listTable(mom.getSectionFPlannedActivities(),
                    new String[]{"Activity", "Target Date"},
                    new float[]{65, 35},
                    new String[]{"activityName", "targetDate"}));
            doc.add(new Paragraph("\n"));

            // ==================== G ====================
            sectionTitle(doc, "G. TEACHING ASSISTANTSHIP");
            Table g = kvTable();
            kvRow(g, "20", "Lab hours allocated / week", str(mom.getSectionGLabHours()));
            kvRow(g, "21", "Tutorial hours allocated / week", str(mom.getSectionGTutorialHours()));
            kvRow(g, "22", "Getting enough support from faculty & HoD?", mom.getSectionGSupport());
            kvRow(g, "23", "Remarks if any", mom.getSectionGRemarks());
            doc.add(g);
            doc.add(new Paragraph("\n"));

            // ==================== H ====================
            sectionTitle(doc, "H. SUPERVISOR ASSESSMENT");
            Table h = kvTable();
            kvRow(h, "", "Month", mom.getSectionHMonth());
            kvRow(h, "", "Assessment Scores", mom.getSectionHAssessmentScores());
            kvRow(h, "", "Recommendation", mom.getSectionHRecommendation());
            doc.add(h);
            doc.add(new Paragraph("\n"));

            // ==================== I ====================
            sectionTitle(doc, "I. ENDORSEMENTS AND FINAL APPROVAL");
            Table i = kvTable();
            kvRow(i, "", "Certified Leave", mom.getSectionICertifiedLeave());
            kvRow(i, "", "Certified Fellowship", mom.getSectionICertifiedFellowship());
            kvRow(i, "", "HOI Remarks", mom.getSectionIHoiRemarks());
            kvRow(i, "", "Directorate Remarks", mom.getSectionIDirectorateRemarks());
            kvRow(i, "", "Dean Remarks", mom.getSectionIDeanRemarks());
            doc.add(i);
            doc.add(new Paragraph("\n"));

            // ==================== SIGNATURES (with real data) ====================
            sectionTitle(doc, "SIGNATURES");
            List<MomSignature> signatures = signatureRepository.findByMomId(mom.getId());

            String[][] rolePairs = {
                {"SCHOLAR", "Research Scholar"},
                {"SUPERVISOR", "Supervisor"},
                {"INSTITUTIONAL_RESEARCH_COORDINATOR", "Institutional Research Coordinator"},
                {"HEAD_OF_INSTITUTE", "Head of Institute"},
                {"DEAN_RESEARCH", "Dean Research"}
            };

            Table sig = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
            for (String[] rp : rolePairs) {
                String role = rp[0];
                String label = rp[1];
                Optional<MomSignature> sigOpt = signatures.stream()
                        .filter(s -> role.equalsIgnoreCase(s.getRole()))
                        .findFirst();

                Cell c = new Cell()
                        .setBorder(new SolidBorder(ColorConstants.GRAY, 0.5f))
                        .setPadding(8)
                        .setMinHeight(80);

                c.add(new Paragraph(label).setBold().setFontSize(9).setMarginBottom(2));

                if (sigOpt.isPresent()) {
                    MomSignature s = sigOpt.get();
                    c.add(new Paragraph("Signed by: " + s.getSignedByName()).setFontSize(9).setMarginBottom(1).setMarginTop(4));
                    if (s.getSignedAt() != null) {
                        c.add(new Paragraph("Date: " + s.getSignedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).setFontSize(8).setMarginBottom(1));
                    }
                    if (s.getSignatureHash() != null && s.getSignatureHash().length() > 0) {
                        String shortHash = s.getSignatureHash().length() > 32 ? s.getSignatureHash().substring(0, 32) + "..." : s.getSignatureHash();
                        c.add(new Paragraph("Hash: " + shortHash).setFontSize(6).setFontColor(ColorConstants.GRAY));
                    }
                } else {
                    c.add(new Paragraph("\n\nSignature: _____________________").setFontSize(8).setMarginTop(4));
                    c.add(new Paragraph("(Not signed yet)").setFontSize(7).setItalic().setFontColor(ColorConstants.GRAY));
                }
                sig.addCell(c);
            }
            doc.add(sig);

            doc.close();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private void sectionTitle(Document doc, String text) {
        doc.add(new Paragraph(text).setBold().setFontSize(11).setFontColor(SRM_BLUE)
                .setBackgroundColor(LIGHT_GRAY).setPadding(4).setMarginBottom(4).setMarginTop(6));
    }

    private Table kvTable() {
        return new Table(UnitValue.createPercentArray(new float[]{8, 42, 50})).useAllAvailableWidth();
    }

    private void kvRow(Table t, String num, String label, String value) {
        t.addCell(new Cell().add(new Paragraph(num == null ? "" : num)).setFontSize(9).setPadding(3).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f)));
        t.addCell(new Cell().add(new Paragraph(label)).setFontSize(9).setPadding(3).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f)));
        t.addCell(new Cell().add(new Paragraph(value == null || value.isEmpty() ? "-" : value)).setFontSize(9).setPadding(3).setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f)));
    }

    private void addMetaRow(Table t, String k, String v) {
        t.addCell(new Cell().add(new Paragraph(k)).setBold().setFontSize(9).setPadding(3).setBackgroundColor(LIGHT_GRAY));
        t.addCell(new Cell().add(new Paragraph(v == null || v.isEmpty() ? "-" : v)).setFontSize(9).setPadding(3));
    }

    @SuppressWarnings("unchecked")
    private Table listTable(String json, String[] headers, float[] widths, String[] keys) {
        Table t = new Table(UnitValue.createPercentArray(widths)).useAllAvailableWidth();
        for (String h : headers) {
            t.addHeaderCell(new Cell().add(new Paragraph(h)).setBold().setFontSize(9).setPadding(3)
                    .setBackgroundColor(LIGHT_GRAY).setBorder(new SolidBorder(ColorConstants.GRAY, 0.5f)));
        }
        List<Map<String, Object>> rows = parseList(json);
        if (rows.isEmpty()) {
            t.addCell(new Cell(1, headers.length).add(new Paragraph("No data").setFontSize(9).setItalic()).setPadding(3));
            return t;
        }
        for (Map<String, Object> r : rows) {
            for (String k : keys) {
                Object v = r.get(k);
                String s = v == null ? "" : String.valueOf(v);
                if (s.isEmpty()) s = "-";
                t.addCell(new Cell().add(new Paragraph(s)).setFontSize(9).setPadding(3)
                        .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f)));
            }
        }
        return t;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseList(String json) {
        try {
            if (json == null || json.isBlank()) return List.of();
            return mapper.readValue(json, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    private String str(Object o) { return o == null ? "" : String.valueOf(o); }
}