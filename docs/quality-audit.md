# 题库与解析质量审核报告

- 生成时间：2026/6/25 20:03:58
- 审核对象：数学真题刷题小程序数据与解析索引。
- 原则：宁缺毋错；无法可靠匹配的解析不强行展示，低置信度映射标为需校对。
- 生成脚本：tools/audit-quality.js

## 总览

- 题目记录：930
- 可显示解析的题目记录：893
- 待补写/待匹配解析：37
- 题目级解析映射：893
- 题号级解析键：819
- 已发现解析源年份：37
- 需校对解析或题目：161
- 相似度兜底映射：30
- BY_ID 与同题号 direct 解析不一致：0
- 2004 年后题号不一致但仍标 ok：0
- 同卷多题复用同一解析可疑组：27

## 年份覆盖

| 年份 | 题目记录 | 有解析 | 待补写 | 需校对 |
|---|---:|---:|---:|---:|
| 1987 | 21 | 21 | 0 | 4 |
| 1988 | 23 | 22 | 1 | 8 |
| 1989 | 24 | 24 | 0 | 10 |
| 1990 | 23 | 23 | 0 | 3 |
| 1991 | 23 | 22 | 1 | 11 |
| 1992 | 24 | 24 | 0 | 8 |
| 1993 | 25 | 23 | 2 | 10 |
| 1995 | 23 | 23 | 0 | 8 |
| 1996 | 26 | 25 | 1 | 11 |
| 1997 | 24 | 23 | 1 | 9 |
| 1998 | 24 | 24 | 0 | 11 |
| 1999 | 23 | 22 | 1 | 9 |
| 2000 | 23 | 21 | 2 | 0 |
| 2001 | 23 | 22 | 1 | 2 |
| 2002 | 25 | 22 | 3 | 2 |
| 2003 | 30 | 28 | 2 | 7 |
| 2004 | 23 | 23 | 0 | 0 |
| 2005 | 23 | 23 | 0 | 0 |
| 2006 | 23 | 23 | 0 | 0 |
| 2007 | 24 | 24 | 0 | 0 |
| 2008 | 23 | 23 | 0 | 0 |
| 2009 | 23 | 23 | 0 | 1 |
| 2010 | 23 | 23 | 0 | 0 |
| 2011 | 23 | 23 | 0 | 1 |
| 2012 | 23 | 23 | 0 | 1 |
| 2013 | 23 | 23 | 0 | 0 |
| 2014 | 23 | 23 | 0 | 0 |
| 2015 | 23 | 23 | 0 | 0 |
| 2016 | 23 | 23 | 0 | 0 |
| 2017 | 23 | 23 | 0 | 0 |
| 2018 | 23 | 23 | 0 | 0 |
| 2019 | 23 | 23 | 0 | 2 |
| 2020 | 23 | 23 | 0 | 1 |
| 2021 | 22 | 22 | 0 | 1 |
| 2022 | 22 | 22 | 0 | 22 |
| 2023 | 22 | 22 | 0 | 1 |
| 2024 | 66 | 66 | 0 | 5 |
| 2025 | 22 | 0 | 22 | 13 |

## 待补写清单

- 1988 真题 第23题：math1_1988_main_q23；# 十一、(本题满分6分) 设随机变量 $X$ 的概率密度函数为 $f_{X}(x) = \frac{1}{\pi(1 + x^{2})}$ ，求随机变量 $Y = 1 - \sqrt[3]{X}$ 的概率密度函数 $f_{Y}(y)$
- 1991 真题 第22题：math1_1991_main_q22；# 十、填空题（本题共2小题，每小题3分，满分6分） (2) 随机地向半圆 $0 < y < \sqrt{2ax - x^2}$ ( $a > 0$ ) 内掷一点, 点落在半圆内任何区域的概率与该区域的面积成正比, 则原点与该点的连线与 $x$ 轴的夹角小于 $\frac{\pi}{4}$ 的概率为
- 1993 真题 第23题：math1_1993_main_q23；# 十一、（本题满分6分） （1）求 $X$ 的数学期望 $E(X)$ 和方差 $D(X)$
- 1993 真题 第24题：math1_1993_main_q24；# 十一、（本题满分6分） (2) 求 $X$ 与 $/X/$ 的协方差，并问 $X$ 与 $/X/$ 是否不相关？
- 1996 真题 第23题：math1_1996_main_q23；# 十、填空题（本题共2小题，每小题3分，满分6分） （1）设工厂 $A$ 和工厂 $B$ 的产品的次品率分别为 $1\%$ 和 $2\%$ ，现从由 $A$ 厂和 $B$ 厂的产品分别占 $60\%$ 和 $40\%$ 的一批产品中随机抽取一件，发现是次品，则该次品属于 $A$ 厂生产的概率为
- 1997 真题 第24题：math1_1997_main_q24；# 十、(本题满分5分) 设总体 $X$ 的概率密度为 $$ f (x) = \left\{ \begin{array}{l l} (\theta + 1) x ^ {\theta}, & 0 < x < 1, \\ 0, & \text {其 他}, \end{array} \right. $$ 其中 $\theta
- 1999 真题 第23题：math1_1999_main_q23；# 十三、(本题满分6分) (2) 求 $\hat{\theta}$ 的方差 $D(\hat{\theta})$ .
- 2000 真题 第22题：math1_2000_main_q22；# 十二、(本题满分8分) 某流水生产线上每个产品不合格的概率为 $p(0 < p < 1)$ , 各产品合格与否相互独立, 当出现一个不合格产品时即停机检修. 设开机后第一次停机时已生产了的产品个数为 $X$ . 求 $X$ 的数学期望 $E(X)$ 和方差 $D(X)$ .
- 2000 真题 第23题：math1_2000_main_q23；# 十三、(本题满分6分) 设某种元件的使用寿命 $X$ 的概率密度为 $$ f (x; \theta) = \left\{ \begin{array}{l l} 2 \mathrm {e} ^ {- 2 (x - \theta)}, & x \geqslant \theta , \\ 0, & x < \theta 
- 2001 真题 第21题：math1_2001_main_q21；# 十一、(本题满分7分) (1) 在发车时有 $n$ 个乘客的条件下, 中途有 $m$ 人下车的概率;
- 2002 真题 第21题：math1_2002_main_q21；# 十、(本题满分8分) （1）如果 $A, B$ 相似，试证 $A, B$ 的特征多项式相等
- 2002 真题 第22题：math1_2002_main_q22；# 十、(本题满分8分) (2) 举一个 2 阶方阵的例子说明 (1) 的逆命题不成立.
- 2002 真题 第23题：math1_2002_main_q23；# 十、(本题满分8分) (3) 当 $A, B$ 均为实对称矩阵时, 试证 (1) 的逆命题成立.
- 2003 真题 第26题：math1_2003_main_q26；# 十一、(本题满分10分) (1) 乙箱中次品件数 $X$ 的数学期望;
- 2003 真题 第30题：math1_2003_main_q30；# 十二、(本题满分8分) (3) 如果用 $\hat{\theta}$ 作为 $\theta$ 的估计量, 讨论它是否具有无偏性.
- 2025 真题 第01题：math1_2025_main_q01；1．已知函数 $f { \big ( } x { \big ) } = \int _ { 0 } ^ { x } \mathbf e ^ { t ^ { 2 } } \sin t \mathrm d t$ ， $g \left( x \right) = \int _ { 0 } ^ { x } \mathrm { e 
- 2025 真题 第02题：math1_2025_main_q02；2．已知级数： $\textcircled { 1 } \sum _ { n = 1 } ^ { \infty } \sin \frac { n ^ { 3 } \pi } { n ^ { 2 } + 1 }$ ； $\textcircled { 2 } \sum _ { n = 1 } ^ { \infty } ( 
- 2025 真题 第03题：math1_2025_main_q03；3．设函数 $f(x)$ 在区间 $(0,+\infty)$ 上可导，则 A．当 $\lim_{x\to+\infty} f(x)$ 存在时，$\lim_{x\to+\infty} f'(x)$ 存在． B．当 $\lim_{x\to+\infty} f'(x)$ 存在时，$\lim_{x\to+\infty} f(x
- 2025 真题 第04题：math1_2025_main_q04；4．设函数 $f(x,y)$ 连续，则 $\int_{-2}^{2}\mathrm{d}x\int_{4-x^2}^{4} f(x,y)\,\mathrm{d}y =$ A．$\int_0^4 \left[\int_{-2}^{-\sqrt{4-y}} f(x,y)\,\mathrm{d}x + \int_{\sqrt
- 2025 真题 第05题：math1_2025_main_q05；5．二次型 $f { \left( x _ { _ { 1 } } , x _ { _ { 2 } } , x _ { _ { 3 } } \right) } = x _ { _ { 1 } } ^ { 2 } + 2 x _ { _ { 1 } } x _ { _ { 2 } } + 2 x _ { _ { 1 } 
- 2025 真题 第06题：math1_2025_main_q06；6．设 $\pmb { \alpha } _ { 1 } , \pmb { \alpha } _ { 2 } , \pmb { \alpha } _ { 3 } , \pmb { \alpha } _ { 4 }$ 是 $n$ 维列向量， ${ \pmb { \alpha } } _ { 1 } , { \pmb { 
- 2025 真题 第07题：math1_2025_main_q07；7．设 $n$ 阶矩阵 $A , B , C$ 满足 $r \left( A \right) + r \left( B \right) + r \left( C \right) = r \left( A B C \right) + 2 n$ ，给出下列四个结论： $$ \begin{array}{l} ① r (A B
- 2025 真题 第08题：math1_2025_main_q08；8．设二维随机变量 $(X,Y)$ 服从正态分布 $N(0,0;1,1;\rho)$，其中 $\rho\in(-1,1)$。若 $a,b$ 为满足 $a^2+b^2=1$ 的任意实数，则 $D(aX+bY)$ 的最大值为 A．1 B．2 C．$1+/\rho/$ D．$1+\rho^2$ 【答案】C 【解析】由于 $D
- 2025 真题 第09题：math1_2025_main_q09；9．设 $X _ { 1 } , X _ { 2 } , \cdots , X _ { 2 0 }$ 是来自总体 $B { \left( 1 , 0 . 1 \right) }$ 的简单随机样本.令 $T = \sum _ { i = 1 } ^ { 2 0 } X _ { i }$ ，利用泊松分布近似表示二项分布的方
- 2025 真题 第10题：math1_2025_main_q10；10．设 $X_1,X_2,\cdots,X_n$ 为来自正态总体 $N(\mu,2)$ 的简单随机样本。记 $\overline X=\frac1n\sum_{i=1}^n X_i$，$Z_\alpha$ 表示标准正态分布的上侧 $\alpha$ 分位数。假设检验问题 $H_0:\mu\leq 1, H_1:\mu>
- 2025 真题 第11题：math1_2025_main_q11；11． $\operatorname* { l i m } _ { x \to 0 ^ { + } } { \frac { x ^ { x } - 1 } { \ln x \cdot \ln ( 1 - x ) } } = \qquad \cdot$ 【答案】-1 【解析】 $$ \lim _ {x \rightarr
- 2025 真题 第12题：math1_2025_main_q12；12.已知函数 $f ( x ) = \left\{ { \begin{array} { l l } { 0 , } & { 0 \leq x < { \frac { 1 } { 2 } } , } \\ { } & { } \\ { x ^ { 2 } , } & { { \frac { 1 } { 2 } } \l
- 2025 真题 第13题：math1_2025_main_q13；13. 已知函数 $u(x,y,z)=xy^2z^3$，向量 $\pmb n=(2,2,-1)$，则 $\left.\frac{\partial u}{\partial \pmb n}\right/_{(1,1,1)} =$ ______. 【答案】1 【解析】有 $$ \nabla u=(y^2z^3,2xyz^3,
- 2025 真题 第14题：math1_2025_main_q14；14. 已知有向曲线 $L$ 是沿抛物线 $y = 1 - x ^ { 2 }$ 从点 $( 1 , 0 )$ 到点 $( - 1 , 0 )$ 的一段，则曲线积分 $$ \int_ {L} (y + \cos x) d x + (2 x + \cos y) d y = \underline {{}}. $$ 【答案】
- 2025 真题 第15题：math1_2025_main_q15；15. 设矩阵 $A = { \left( \begin{array} { l l l } { 4 } & { 2 } & { - 3 } \\ { a } & { 3 } & { - 4 } \\ { b } & { 5 } & { - 7 } \end{array} \right) } ,$ 若方程组 $A ^ {
- 2025 真题 第16题：math1_2025_main_q16；16. 设 $A , B$ 为两个随机事件，且 $A$ 与 $B$ 相互独立，已知 $P ( A ) = 2 P ( B ) , P ( A \cup B ) = { \frac { 5 } { 8 } } .$ , 则在事件 $A , B$ 至少有一个发生的条件下， $A , B$ 中恰有一个发生的概率为 【答案】 
- 2025 真题 第17题：math1_2025_main_q17；17．（本题满分 10分） 计算 $$ \int_0^1 \frac{1}{(x+1)(x^2-2x+2)}\,\mathrm{d}x. $$ 【解析】 $$ \frac{1}{(x+1)(x^2-2x+2)} =\frac{1}{5}\cdot\frac{1}{x+1} +\frac{-\frac15x+\frac3
- 2025 真题 第18题：math1_2025_main_q18；18.（本题满分 12分） 已知函数 $f(u)$ 在区间 $(0,+\infty)$ 内具有二阶导数，记 $g(x,y)=f\left(\frac{x}{y}\right)$。若 $g(x,y)$ 满足 $$ x^2\frac{\partial^2 g}{\partial x^2} +xy\frac{\partial
- 2025 真题 第19题：math1_2025_main_q19；19.（本题满分 12分） 设函数 $f(x)$ 在区间 $(a,b)$ 内可导。证明：导函数 $f'(x)$ 在 $(a,b)$ 内严格单调增加的充分必要条件是：对 $(a,b)$ 内任意 $x_1,x_2,x_3$，当 $x_1<x_2<x_3$ 时， $$ \frac{f(x_2)-f(x_1)}{x_2-x_1
- 2025 真题 第20题：math1_2025_main_q20；20.（本题满分 12分） 设 $\Sigma$ 是由直线 $\left\{\begin{array}{l}x=0,\\ y=0\end{array}\right.$ 绕直线 $\left\{\begin{array}{l}x=t,\\ y=t,\\ z=t\end{array}\right.$（$t$ 为参数）旋转一
- 2025 真题 第21题：math1_2025_main_q21；21.（本题满分 10分） 设矩阵 $A = { \left( \begin{array} { l l l } { 0 } & { - 1 } & { 2 } \\ { - 1 } & { 0 } & { 2 } \\ { - 1 } & { - 1 } & { a } \end{array} \right) } ,$
- 2025 真题 第22题：math1_2025_main_q22；22．（本题满分 12分） 投保人的损失事件发生时，保险公司的赔付额 Y 与投保人的损失额 $X$ 的关系为$Y = { \left\{ \begin{array} { l l } { 0 , X \leq 1 0 0 , } \\ { x - 1 0 0 , X > 1 0 0 . } \end{array} \ri

## 需校对清单

- 1987 真题 第07题：math1_1987_main_q07；解析需校对 (sequential_year_index)
- 1987 真题 第13题：math1_1987_main_q13；解析需校对 (sequential_year_index)
- 1987 真题 第18题：math1_1987_main_q18；解析需校对 (sequential_year_index)
- 1987 真题 第19题：math1_1987_main_q19；解析需校对 (sequential_year_index)
- 1988 真题 第02题：math1_1988_main_q02；解析需校对 (sequential_year_index)
- 1988 真题 第07题：math1_1988_main_q07；解析需校对 (sequential_year_index)
- 1988 真题 第17题：math1_1988_main_q17；解析需校对 (sequential_year_index)
- 1988 真题 第18题：math1_1988_main_q18；解析需校对 (sequential_year_index)
- 1988 真题 第19题：math1_1988_main_q19；解析需校对 (sequential_year_index)
- 1988 真题 第20题：math1_1988_main_q20；解析需校对 (sequential_year_index)
- 1988 真题 第21题：math1_1988_main_q21；解析需校对 (sequential_year_index)
- 1988 真题 第22题：math1_1988_main_q22；解析需校对 (sequential_year_index)
- 1989 真题 第07题：math1_1989_main_q07；解析需校对 (sequential_year_index)
- 1989 真题 第09题：math1_1989_main_q09；解析需校对 (sequential_year_index)
- 1989 真题 第11题：math1_1989_main_q11；解析需校对 (sequential_year_index)
- 1989 真题 第17题：math1_1989_main_q17；解析需校对 (sequential_year_index)
- 1989 真题 第19题：math1_1989_main_q19；解析需校对 (sequential_year_index)
- 1989 真题 第20题：math1_1989_main_q20；解析需校对 (sequential_year_index)
- 1989 真题 第21题：math1_1989_main_q21；解析需校对 (sequential_year_index)
- 1989 真题 第22题：math1_1989_main_q22；解析需校对 (sequential_year_index)
- 1989 真题 第23题：math1_1989_main_q23；解析需校对 (sequential_year_index)
- 1989 真题 第24题：math1_1989_main_q24；解析需校对 (similarity_fallback:0.224)
- 1990 真题 第01题：math1_1990_main_q01；解析需校对 (sequential_year_index)
- 1990 真题 第12题：math1_1990_main_q12；解析需校对 (sequential_year_index)
- 1990 真题 第21题：math1_1990_main_q21；解析需校对 (sequential_year_index)
- 1991 真题 第03题：math1_1991_main_q03；解析需校对 (sequential_year_index)
- 1991 真题 第09题：math1_1991_main_q09；解析需校对 (sequential_year_index)
- 1991 真题 第10题：math1_1991_main_q10；解析需校对 (sequential_year_index)
- 1991 真题 第15题：math1_1991_main_q15；解析需校对 (sequential_year_index)
- 1991 真题 第16题：math1_1991_main_q16；解析需校对 (sequential_year_index)
- 1991 真题 第17题：math1_1991_main_q17；解析需校对 (sequential_year_index)
- 1991 真题 第18题：math1_1991_main_q18；解析需校对 (sequential_year_index)
- 1991 真题 第19题：math1_1991_main_q19；解析需校对 (sequential_year_index)
- 1991 真题 第20题：math1_1991_main_q20；解析需校对 (sequential_year_index)
- 1991 真题 第21题：math1_1991_main_q21；解析需校对 (sequential_year_index)
- 1991 真题 第23题：math1_1991_main_q23；解析需校对 (similarity_fallback:0.286)
- 1992 真题 第10题：math1_1992_main_q10；解析需校对 (sequential_year_index)
- 1992 真题 第17题：math1_1992_main_q17；解析需校对 (sequential_year_index)
- 1992 真题 第19题：math1_1992_main_q19；解析需校对 (sequential_year_index)
- 1992 真题 第20题：math1_1992_main_q20；解析需校对 (sequential_year_index)
- 1992 真题 第21题：math1_1992_main_q21；解析需校对 (sequential_year_index)
- 1992 真题 第22题：math1_1992_main_q22；解析需校对 (similarity_fallback:0.222)
- 1992 真题 第23题：math1_1992_main_q23；解析需校对 (similarity_fallback:0.136)
- 1992 真题 第24题：math1_1992_main_q24；解析需校对 (similarity_fallback:0.205)
- 1993 真题 第03题：math1_1993_main_q03；解析需校对 (sequential_year_index)
- 1993 真题 第08题：math1_1993_main_q08；解析需校对 (sequential_year_index)
- 1993 真题 第10题：math1_1993_main_q10；解析需校对 (sequential_year_index)
- 1993 真题 第17题：math1_1993_main_q17；解析需校对 (sequential_year_index)
- 1993 真题 第18题：math1_1993_main_q18；解析需校对 (sequential_year_index)
- 1993 真题 第19题：math1_1993_main_q19；解析需校对 (sequential_year_index)
- 1993 真题 第20题：math1_1993_main_q20；解析需校对 (sequential_year_index)
- 1993 真题 第21题：math1_1993_main_q21；解析需校对 (sequential_year_index)
- 1993 真题 第22题：math1_1993_main_q22；解析需校对 (sequential_year_index)
- 1993 真题 第25题：math1_1993_main_q25；解析需校对 (similarity_fallback:0.150)
- 1995 真题 第06题：math1_1995_main_q06；解析需校对 (sequential_year_index)
- 1995 真题 第07题：math1_1995_main_q07；解析需校对 (sequential_year_index)
- 1995 真题 第14题：math1_1995_main_q14；解析需校对 (sequential_year_index)
- 1995 真题 第18题：math1_1995_main_q18；解析需校对 (sequential_year_index)
- 1995 真题 第20题：math1_1995_main_q20；解析需校对 (sequential_year_index)
- 1995 真题 第21题：math1_1995_main_q21；解析需校对 (sequential_year_index)
- 1995 真题 第22题：math1_1995_main_q22；解析需校对 (sequential_year_index)
- 1995 真题 第23题：math1_1995_main_q23；解析需校对 (similarity_fallback:0.340)
- 1996 真题 第06题：math1_1996_main_q06；解析需校对 (sequential_year_index)
- 1996 真题 第11题：math1_1996_main_q11；解析需校对 (sequential_year_index)
- 1996 真题 第17题：math1_1996_main_q17；解析需校对 (sequential_year_index)
- 1996 真题 第18题：math1_1996_main_q18；解析需校对 (sequential_year_index)
- 1996 真题 第19题：math1_1996_main_q19；解析需校对 (sequential_year_index)
- 1996 真题 第20题：math1_1996_main_q20；解析需校对 (sequential_year_index)
- 1996 真题 第21题：math1_1996_main_q21；解析需校对 (sequential_year_index)
- 1996 真题 第22题：math1_1996_main_q22；解析需校对 (sequential_year_index)
- 1996 真题 第24题：math1_1996_main_q24；解析需校对 (similarity_fallback:0.226)
- 1996 真题 第25题：math1_1996_main_q25；解析需校对 (similarity_fallback:0.656)
- 1996 真题 第26题：math1_1996_main_q26；解析需校对 (similarity_fallback:0.200)
- 1997 真题 第05题：math1_1997_main_q05；解析需校对 (sequential_year_index)
- 1997 真题 第10题：math1_1997_main_q10；解析需校对 (sequential_year_index)
- 1997 真题 第13题：math1_1997_main_q13；解析需校对 (sequential_year_index)
- 1997 真题 第18题：math1_1997_main_q18；解析需校对 (sequential_year_index)
- 1997 真题 第19题：math1_1997_main_q19；解析需校对 (sequential_year_index)
- 1997 真题 第20题：math1_1997_main_q20；解析需校对 (sequential_year_index)
- 1997 真题 第21题：math1_1997_main_q21；解析需校对 (sequential_year_index)
- 1997 真题 第22题：math1_1997_main_q22；解析需校对 (sequential_year_index)
- 1997 真题 第23题：math1_1997_main_q23；解析需校对 (sequential_year_index)
- 1998 真题 第04题：math1_1998_main_q04；解析需校对 (sequential_year_index)
- 1998 真题 第05题：math1_1998_main_q05；解析需校对 (sequential_year_index)
- 1998 真题 第08题：math1_1998_main_q08；解析需校对 (sequential_year_index)
- 1998 真题 第13题：math1_1998_main_q13；解析需校对 (sequential_year_index)
- 1998 真题 第18题：math1_1998_main_q18；解析需校对 (sequential_year_index)
- 1998 真题 第19题：math1_1998_main_q19；解析需校对 (sequential_year_index)
- 1998 真题 第20题：math1_1998_main_q20；解析需校对 (sequential_year_index)
- 1998 真题 第21题：math1_1998_main_q21；解析需校对 (sequential_year_index)
- 1998 真题 第22题：math1_1998_main_q22；解析需校对 (sequential_year_index)
- 1998 真题 第23题：math1_1998_main_q23；解析需校对 (sequential_year_index)
- 1998 真题 第24题：math1_1998_main_q24；解析需校对 (similarity_fallback:0.121)
- 1999 真题 第04题：math1_1999_main_q04；解析需校对 (sequential_year_index)
- 1999 真题 第08题：math1_1999_main_q08；解析需校对 (sequential_year_index)
- 1999 真题 第09题：math1_1999_main_q09；解析需校对 (sequential_year_index)
- 1999 真题 第15题：math1_1999_main_q15；解析需校对 (sequential_year_index)
- 1999 真题 第18题：math1_1999_main_q18；解析需校对 (sequential_year_index)
- 1999 真题 第19题：math1_1999_main_q19；解析需校对 (sequential_year_index)
- 1999 真题 第20题：math1_1999_main_q20；解析需校对 (sequential_year_index)
- 1999 真题 第21题：math1_1999_main_q21；解析需校对 (sequential_year_index)
- 1999 真题 第22题：math1_1999_main_q22；解析需校对 (similarity_fallback:0.231)
- 2001 真题 第22题：math1_2001_main_q22；解析需校对 (similarity_fallback:0.200)
- 2001 真题 第23题：math1_2001_main_q23；解析需校对 (similarity_fallback:0.351)
- 2002 真题 第24题：math1_2002_main_q24；解析需校对 (similarity_fallback:0.129)
- 2002 真题 第25题：math1_2002_main_q25；解析需校对 (similarity_fallback:0.120)
- 2003 真题 第20题：math1_2003_main_q20；解析需校对 (similarity_fallback:0.244)
- 2003 真题 第23题：math1_2003_main_q23；解析需校对 (similarity_fallback:0.389)
- 2003 真题 第24题：math1_2003_main_q24；解析需校对 (similarity_fallback:0.486)
- 2003 真题 第25题：math1_2003_main_q25；解析需校对 (similarity_fallback:0.320)
- 2003 真题 第27题：math1_2003_main_q27；解析需校对 (similarity_fallback:0.250)
- 2003 真题 第28题：math1_2003_main_q28；解析需校对 (similarity_fallback:0.333)
- 2003 真题 第29题：math1_2003_main_q29；解析需校对 (similarity_fallback:0.167)
- 2009 真题 第20题：math1_2009_main_q20；解析需校对 (similarity_fallback:0.373)
- 2011 真题 第18题：math1_2011_main_q18；解析需校对 (similarity_fallback:0.306)
- 2012 真题 第17题：math1_2012_main_q17；解析需校对 (similarity_fallback:0.455)
- 2019 真题 第18题：math1_2019_main_q18；解析需校对 (similarity_fallback:0.509)
- 2019 真题 第20题：math1_2019_main_q20；解析需校对 (similarity_fallback:0.320)
- 2020 真题 第22题：math1_2020_main_q22；解析需校对 (similarity_fallback:0.217)
- 2021 真题 第05题：math1_2021_main_q05；解析需校对 (similarity_fallback:0.140)
- 2022 真题 第01题：math1_2022_main_q01；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第02题：math1_2022_main_q02；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第03题：math1_2022_main_q03；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第04题：math1_2022_main_q04；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第05题：math1_2022_main_q05；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第06题：math1_2022_main_q06；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第07题：math1_2022_main_q07；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第08题：math1_2022_main_q08；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第09题：math1_2022_main_q09；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第10题：math1_2022_main_q10；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第11题：math1_2022_main_q11；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第12题：math1_2022_main_q12；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第13题：math1_2022_main_q13；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第14题：math1_2022_main_q14；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第15题：math1_2022_main_q15；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第16题：math1_2022_main_q16；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第17题：math1_2022_main_q17；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第18题：math1_2022_main_q18；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第19题：math1_2022_main_q19；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第20题：math1_2022_main_q20；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第21题：math1_2022_main_q21；题目源需校对；解析需校对 (year_question_no)
- 2022 真题 第22题：math1_2022_main_q22；题目源需校对；解析需校对 (year_question_no)
- 2023 真题 第15题：math1_2023_main_q15；题目源需校对
- 2024 真题 第02题：math1_2024_main_q02；题目源需校对
- 2024 真题+答案 第02题：math1_2024_main_with_answers_q02；题目源需校对
- 2024 真题及参考答案 第02题：math1_2024_main_ref_answers_q02；题目源需校对
- 2024 真题及参考答案 第13题：math1_2024_main_ref_answers_q13；题目源需校对
- 2024 真题及参考答案 第21题：math1_2024_main_ref_answers_q21；题目源需校对
- 2025 真题 第03题：math1_2025_main_q03；题目源需校对
- 2025 真题 第04题：math1_2025_main_q04；题目源需校对
- 2025 真题 第06题：math1_2025_main_q06；题目源需校对
- 2025 真题 第07题：math1_2025_main_q07；题目源需校对
- 2025 真题 第08题：math1_2025_main_q08；题目源需校对
- 2025 真题 第10题：math1_2025_main_q10；题目源需校对
- 2025 真题 第11题：math1_2025_main_q11；题目源需校对
- 2025 真题 第13题：math1_2025_main_q13；题目源需校对
- 2025 真题 第15题：math1_2025_main_q15；题目源需校对
- 2025 真题 第17题：math1_2025_main_q17；题目源需校对
- 2025 真题 第18题：math1_2025_main_q18；题目源需校对
- 2025 真题 第19题：math1_2025_main_q19；题目源需校对
- 2025 真题 第20题：math1_2025_main_q20；题目源需校对

## 一致性检查

### 相似度兜底映射

- 1989 真题 第24题：math1_1989_main_q24；method=similarity_fallback:0.224；chunk=11；score=0.224；quality=manual_check
- 1991 真题 第23题：math1_1991_main_q23；method=similarity_fallback:0.286；chunk=11；score=0.286；quality=manual_check
- 1992 真题 第22题：math1_1992_main_q22；method=similarity_fallback:0.222；chunk=1；score=0.222；quality=manual_check
- 1992 真题 第23题：math1_1992_main_q23；method=similarity_fallback:0.136；chunk=2；score=0.136；quality=manual_check
- 1992 真题 第24题：math1_1992_main_q24；method=similarity_fallback:0.205；chunk=11；score=0.205；quality=manual_check
- 1993 真题 第25题：math1_1993_main_q25；method=similarity_fallback:0.150；chunk=11；score=0.15；quality=manual_check
- 1995 真题 第23题：math1_1995_main_q23；method=similarity_fallback:0.340；chunk=11；score=0.34；quality=manual_check
- 1996 真题 第24题：math1_1996_main_q24；method=similarity_fallback:0.226；chunk=2；score=0.226；quality=manual_check
- 1996 真题 第25题：math1_1996_main_q25；method=similarity_fallback:0.656；chunk=11；score=0.656；quality=manual_check
- 1996 真题 第26题：math1_1996_main_q26；method=similarity_fallback:0.200；chunk=11；score=0.2；quality=manual_check
- 1998 真题 第24题：math1_1998_main_q24；method=similarity_fallback:0.121；chunk=15；score=0.121；quality=manual_check
- 1999 真题 第22题：math1_1999_main_q22；method=similarity_fallback:0.231；chunk=13；score=0.231；quality=manual_check
- 2001 真题 第22题：math1_2001_main_q22；method=similarity_fallback:0.200；chunk=10；score=0.2；quality=manual_check
- 2001 真题 第23题：math1_2001_main_q23；method=similarity_fallback:0.351；chunk=20；score=0.351；quality=manual_check
- 2002 真题 第24题：math1_2002_main_q24；method=similarity_fallback:0.129；chunk=10；score=0.129；quality=manual_check
- 2002 真题 第25题：math1_2002_main_q25；method=similarity_fallback:0.120；chunk=20；score=0.12；quality=manual_check
- 2003 真题 第20题：math1_2003_main_q20；method=similarity_fallback:0.244；chunk=17；score=0.244；quality=manual_check
- 2003 真题 第23题：math1_2003_main_q23；method=similarity_fallback:0.389；chunk=18；score=0.389；quality=manual_check
- 2003 真题 第24题：math1_2003_main_q24；method=similarity_fallback:0.486；chunk=19；score=0.486；quality=manual_check
- 2003 真题 第25题：math1_2003_main_q25；method=similarity_fallback:0.320；chunk=19；score=0.32；quality=manual_check
- 2003 真题 第27题：math1_2003_main_q27；method=similarity_fallback:0.250；chunk=21；score=0.25；quality=manual_check
- 2003 真题 第28题：math1_2003_main_q28；method=similarity_fallback:0.333；chunk=22；score=0.333；quality=manual_check
- 2003 真题 第29题：math1_2003_main_q29；method=similarity_fallback:0.167；chunk=22；score=0.167；quality=manual_check
- 2009 真题 第20题：math1_2009_main_q20；method=similarity_fallback:0.373；chunk=19；score=0.373；quality=manual_check
- 2011 真题 第18题：math1_2011_main_q18；method=similarity_fallback:0.306；chunk=17；score=0.306；quality=manual_check
- 2012 真题 第17题：math1_2012_main_q17；method=similarity_fallback:0.455；chunk=16；score=0.455；quality=manual_check
- 2019 真题 第18题：math1_2019_main_q18；method=similarity_fallback:0.509；chunk=17；score=0.509；quality=manual_check
- 2019 真题 第20题：math1_2019_main_q20；method=similarity_fallback:0.320；chunk=19；score=0.32；quality=manual_check
- 2020 真题 第22题：math1_2020_main_q22；method=similarity_fallback:0.217；chunk=21；score=0.217；quality=manual_check
- 2021 真题 第05题：math1_2021_main_q05；method=similarity_fallback:0.140；chunk=2；score=0.14；quality=manual_check

### BY_ID 与 Direct 不一致

- 无

### 题号不一致但仍标 ok

- 无

### 同卷多题复用同一解析

- 1989 真题：第23题、第24题 复用同一解析
- 1991 真题：第21题、第23题 复用同一解析
- 1992 真题：第19题、第22题 复用同一解析
- 1992 真题：第20题、第23题 复用同一解析
- 1992 真题：第21题、第24题 复用同一解析
- 1993 真题：第22题、第25题 复用同一解析
- 1995 真题：第22题、第23题 复用同一解析
- 1996 真题：第21题、第24题 复用同一解析
- 1996 真题：第22题、第25题、第26题 复用同一解析
- 1998 真题：第23题、第24题 复用同一解析
- 1999 真题：第21题、第22题 复用同一解析
- 2001 真题：第10题、第22题 复用同一解析
- 2001 真题：第20题、第23题 复用同一解析
- 2002 真题：第10题、第24题 复用同一解析
- 2002 真题：第20题、第25题 复用同一解析
- 2003 真题：第17题、第20题 复用同一解析
- 2003 真题：第18题、第23题 复用同一解析
- 2003 真题：第19题、第24题、第25题 复用同一解析
- 2003 真题：第21题、第27题 复用同一解析
- 2003 真题：第22题、第28题、第29题 复用同一解析
- 2009 真题：第19题、第20题 复用同一解析
- 2011 真题：第17题、第18题 复用同一解析
- 2012 真题：第16题、第17题 复用同一解析
- 2019 真题：第17题、第18题 复用同一解析
- 2019 真题：第19题、第20题 复用同一解析
- 2020 真题：第21题、第22题 复用同一解析
- 2021 真题：第02题、第05题 复用同一解析

## 审核结论

- 程序只使用题目 ID 级解析映射展示单题解析，避免早期年份大题/小题混排导致的单纯题号错配。
- 构建脚本优先使用明确题号 direct 解析；相似度兜底只作为需校对候选展示。
- 2004 年后的题号不一致解析若仍标 ok，会在一致性检查中单独暴露。
- 解析质量为 manual_check 的题目会在小程序筛选、统计、题库表和复习队列中统一计入“需校对”。
- 解析源中的相对图片路径按解析 Markdown 所在目录解析；题目源中的相对图片路径按题目 Markdown 所在目录解析。
- 2025 年当前没有本地解析源，保留为待补写，不自动编造答案。