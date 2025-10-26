// 生物课本风格的家谱图实现
// 采用层次化布局，清晰显示代际关系

class FamilyTree {
    constructor(containerId, data) {
        this.container = d3.select(containerId);
        this.data = data;
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        this.generationGap = 120; // 代际间距
        this.memberGap = 80; // 同代成员间距

        this.init();
    }

    init() {
        // 清空容器
        this.container.html("");

        // 大幅增加宽度
        this.width = Math.max(this.container.node().getBoundingClientRect().width, 2000);
        this.height = this.container.node().getBoundingClientRect().height;

        // 创建SVG
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("background", "transparent");

        this.mainGroup = this.svg.append("g")
            .attr("transform", `translate(100, 50)`);

        this.renderTree();
    }

    // 计算树的布局 - 简化的生物课本风格
    calculateLayout() {
        const generations = [];

        // 简化的布局：每代成员水平排列
        let currentGeneration = 0;
        let queue = [...this.data.children];

        while (queue.length > 0) {
            const currentLevelSize = queue.length;
            const nextQueue = [];

            if (!generations[currentGeneration]) {
                generations[currentGeneration] = [];
            }

            // 计算当前代成员的x坐标 - 大幅增加间距
            const availableWidth = this.width - 200; // 增加边距
            const spacing = availableWidth / (currentLevelSize + 1);

            queue.forEach((member, index) => {
                const x = 100 + (index + 1) * spacing;
                const y = currentGeneration * this.generationGap;

                const positionedMember = {
                    ...member,
                    generation: currentGeneration,
                    x: x,
                    y: y,
                    parent: member.parent || null
                };

                generations[currentGeneration].push(positionedMember);

                // 将子节点加入下一代的队列
                if (member.children) {
                    member.children.forEach(child => {
                        // 保存父节点引用，确保正确父子关系
                        child.parentReference = member;
                        nextQueue.push(child);
                    });
                }
            });

            queue = nextQueue;
            currentGeneration++;
        }

        return generations;
    }

    renderTree() {
        const generations = this.calculateLayout();

        // 调试：输出布局信息
        console.log('Layout generations:', generations);

        // 绘制代际线
        this.renderGenerationLines(generations);

        // 绘制血缘连线
        this.renderBloodlines(generations);

        // 绘制成员节点
        this.renderMembers(generations);

        // 添加代际标记
        this.renderGenerationLabels(generations);
    }

    renderGenerationLines(generations) {
        generations.forEach((gen, genIndex) => {
            if (genIndex === 0) return; // 第一代没有兄弟姐妹连线

            // 按父节点分组
            const siblingsByParent = {};

            gen.forEach(member => {
                if (member.parentReference) {
                    const parentName = member.parentReference.name;
                    if (!siblingsByParent[parentName]) {
                        siblingsByParent[parentName] = [];
                    }
                    siblingsByParent[parentName].push(member);
                }
            });

            // 为每个父节点的亲兄弟姐妹组画连线
            Object.values(siblingsByParent).forEach(siblings => {
                if (siblings.length > 1) {
                    // 按x坐标排序
                    siblings.sort((a, b) => a.x - b.x);

                    const firstSibling = siblings[0];
                    const lastSibling = siblings[siblings.length - 1];

                    // 只在亲兄弟姐妹之间画虚线
                    this.mainGroup.append("line")
                        .attr("x1", firstSibling.x - 15)
                        .attr("y1", firstSibling.y)
                        .attr("x2", lastSibling.x + 15)
                        .attr("y2", lastSibling.y)
                        .attr("class", "generation-line");
                }
            });
        });
    }

    renderBloodlines(generations) {
        generations.forEach((gen, genIndex) => {
            if (genIndex === 0) return; // 第一代没有父代连线

            gen.forEach(member => {
                // 使用保存的父节点引用，确保正确父子关系
                if (member.parentReference) {
                    // 在前一代中查找对应的父节点
                    const parentGen = generations[genIndex - 1];
                    if (parentGen) {
                        const parent = parentGen.find(parentMember =>
                            parentMember.name === member.parentReference.name
                        );

                        if (parent) {
                            console.log(`连线: ${parent.name} -> ${member.name}`, {
                                parentX: parent.x, parentY: parent.y,
                                childX: member.x, childY: member.y
                            });

                            // 检查父节点是否有配偶
                            const hasSpouse = parent.spouse && parent.spouse.length > 0;

                            if (hasSpouse) {
                                // 计算父母和配偶的中心位置
                                const parentCenterX = parent.x; // 父母矩形中心
                                const spouseCenterX = parent.x + 60; // 配偶矩形中心 (父母矩形宽60，配偶矩形宽50，间距35)
                                const coupleCenterX = (parentCenterX + spouseCenterX) / 2; // 夫妻中心位置

                                // 使用水平和垂直的折线：从夫妻中心到子节点顶部
                                const midY = parent.y + 30; // 水平线位置 + 10像素间隙
                                const pathData = `M ${coupleCenterX} ${parent.y + 20}
                                                L ${coupleCenterX} ${midY}
                                                L ${member.x} ${midY}
                                                L ${member.x} ${member.y - 25}`;

                                this.mainGroup.append("path")
                                    .attr("d", pathData)
                                    .attr("class", "bloodline")
                                    .attr("fill", "none");
                            } else {
                                // 没有配偶时使用直线
                                this.mainGroup.append("line")
                                    .attr("x1", parent.x)
                                    .attr("y1", parent.y + 20)
                                    .attr("x2", member.x)
                                    .attr("y2", member.y - 25)
                                    .attr("class", "bloodline");
                            }
                        }
                    } // 结束 if (parentGen)
                } // 结束 if (member.parentReference)
            });
        });
    }

    renderMembers(generations) {
        // 扁平化所有成员
        const allMembers = generations.flat();

        // 创建成员组
        const memberGroups = this.mainGroup.selectAll(".member-group")
            .data(allMembers)
            .enter().append("g")
            .attr("class", "member-group")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .style("cursor", "pointer")
            .on("click", (event, d) => this.showMemberDetails(d));

        // 绘制成员矩形
        memberGroups.append("rect")
            .attr("x", -30)
            .attr("y", -20)
            .attr("width", 60)
            .attr("height", 40)
            .attr("rx", 5)
            .attr("fill", d => this.getMemberColor(d))
            .attr("stroke", "#333")
            .attr("stroke-width", 1);

        // 绘制成员姓名
        memberGroups.append("text")
            .attr("class", "member-name")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .style("font-size", "9px")
            .style("font-weight", "bold")
            .style("fill", "#fff")
            .text(d => this.getShortName(d.name));

        // 绘制统治时期（如果有）
        memberGroups.append("text")
            .attr("class", "member-reign")
            .attr("text-anchor", "middle")
            .attr("dy", "1.8em")
            .style("font-size", "7px")
            .style("fill", "#fff")
            .text(d => d.reign ? d.reign.split("-")[0] : "");

        // 绘制配偶信息
        memberGroups.each(function(d) {
            if (d.spouse && d.spouse.length > 0) {
                const group = d3.select(this);

                // 绘制配偶矩形（放在成员右侧）
                group.append("rect")
                    .attr("x", 35)
                    .attr("y", -15)
                    .attr("width", 50)
                    .attr("height", 30)
                    .attr("rx", 5)
                    .attr("fill", "#9b59b6")
                    .attr("stroke", "#8e44ad")
                    .attr("stroke-width", 1);

                // 绘制配偶连线（水平线）
                group.append("line")
                    .attr("x1", 30)
                    .attr("y1", 0)
                    .attr("x2", 35)
                    .attr("y2", 0)
                    .attr("stroke", "#999")
                    .attr("stroke-width", 1);

                // 绘制配偶姓名（显示第一个配偶）
                group.append("text")
                    .attr("x", 60)
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.3em")
                    .style("font-size", "7px")
                    .style("font-weight", "bold")
                    .style("fill", "#fff")
                    .text(d => {
                        if (d.spouse && d.spouse[0] && d.spouse[0].name) {
                            return d.spouse[0].name.substring(0, 6) + (d.spouse[0].name.length > 6 ? "..." : "");
                        }
                        return "";
                    });

                // 如果有多个配偶，显示数量
                if (d.spouse.length > 1) {
                    group.append("text")
                        .attr("x", 60)
                        .attr("text-anchor", "middle")
                        .attr("dy", "1.8em")
                        .style("font-size", "6px")
                        .style("fill", "#fff")
                        .text(`+${d.spouse.length - 1}`);
                }
            }
        });

        // 添加悬停效果
        memberGroups.on("mouseover", function(event, d) {
            d3.select(this).selectAll("rect")
                .transition()
                .duration(200)
                .attr("stroke-width", 2)
                .attr("stroke", "#e74c3c");
        });

        memberGroups.on("mouseout", function(event, d) {
            d3.select(this).selectAll("rect")
                .transition()
                .duration(200)
                .attr("stroke-width", 1)
                .attr("stroke", "#333");
        });
    }

    renderGenerationLabels(generations) {
        generations.forEach((gen, genIndex) => {
            if (gen.length > 0) {
                this.mainGroup.append("text")
                    .attr("x", -40)
                    .attr("y", gen[0].y)
                    .attr("text-anchor", "end")
                    .attr("class", "generation-label")
                    .text(`第${genIndex + 1}代`);
            }
        });
    }

    getMemberColor(member) {
        if (member.reign && member.title.includes("皇帝")) {
            return "#e74c3c"; // 皇帝 - 红色
        } else if (member.reign) {
            return "#3498db"; // 其他统治者 - 蓝色
        } else if (member.spouse && member.spouse.length > 0) {
            return "#2ecc71"; // 已婚成员 - 绿色
        } else {
            return "#95a5a6"; // 其他成员 - 灰色
        }
    }

    getShortName(fullName) {
        // 简写名字以适应小矩形
        const names = fullName.split("·");
        if (names.length > 1) {
            return names[names.length - 1]; // 取最后一个名字
        }
        return fullName.length > 6 ? fullName.substring(0, 6) + "..." : fullName;
    }

    showMemberDetails(member) {
        // 重用之前的详情显示逻辑
        showNodeDetails(member);
    }

    // 缩放功能
    zoomIn() {
        const currentTransform = d3.zoomTransform(this.svg.node());
        this.svg.transition().call(
            d3.zoom().transform,
            d3.zoomIdentity.scale(currentTransform.k * 1.2)
        );
    }

    zoomOut() {
        const currentTransform = d3.zoomTransform(this.svg.node());
        this.svg.transition().call(
            d3.zoom().transform,
            d3.zoomIdentity.scale(currentTransform.k * 0.8)
        );
    }

    resetView() {
        this.svg.transition().call(
            d3.zoom().transform,
            d3.zoomIdentity
        );
    }
}

// 初始化家谱图
let familyTree;

function initFamilyTree() {
    familyTree = new FamilyTree("#family-tree-canvas", habsburgCompleteData);

    // 添加缩放支持
    d3.select("#family-tree-canvas svg")
        .call(d3.zoom().on("zoom", (event) => {
            d3.select("#family-tree-canvas svg g")
                .attr("transform", event.transform);
        }));
}

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FamilyTree;
}