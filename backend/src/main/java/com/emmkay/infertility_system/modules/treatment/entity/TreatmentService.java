package com.emmkay.infertility_system.modules.treatment.entity;

import com.emmkay.infertility_system.modules.payment.entity.PaymentTransaction;
import com.emmkay.infertility_system.modules.user.entity.User;
import com.emmkay.infertility_system.modules.feedback.entity.Feedback;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "treatment_service")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "duration")
    private int duration;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "service")
    private Set<Feedback> feedbacks = new LinkedHashSet<>();

    @OneToMany(mappedBy = "service")
    private Set<TreatmentRecord> treatmentRecords = new LinkedHashSet<>();

    @ColumnDefault("0")
    @Column(name = "is_remove")
    private Boolean isRemove;

    @OneToMany(mappedBy = "service")
    private Set<PaymentTransaction> paymentTransactions = new LinkedHashSet<>();

    @Size(max = 255)
    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @OneToMany(mappedBy = "service")
    private Set<TreatmentStage> treatmentStages = new LinkedHashSet<>();

}