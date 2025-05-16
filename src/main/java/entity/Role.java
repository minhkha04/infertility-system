package entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "roles")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    @Id
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "description")
    private String description;

    @ColumnDefault("0")
    @Column(name = "is_removed")
    private Boolean isRemoved;

    @OneToMany(mappedBy = "roleName")
    private Set<User> users = new LinkedHashSet<>();

}